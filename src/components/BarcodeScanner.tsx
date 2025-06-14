"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../context/AuthContext";
import {
  doc,
  increment,
  setDoc,
  serverTimestamp,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Loader2 } from "lucide-react";

export default function BarcodeScanner() {
  const [rollNumber, setRollNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userDataobj, currentUser, loading } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();
  const createdAt = `${month + 1} ${year}`;

  // Focus input on mount and after any state changes
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Initial focus
    focusInput();

    // Set up an interval to check and refocus if needed
    const focusInterval = setInterval(focusInput, 1000);

    // Add click event listener to refocus when clicking anywhere on the page
    const handleClick = () => {
      focusInput();
    };
    document.addEventListener("click", handleClick);

    return () => {
      clearInterval(focusInterval);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const validateRollNumber = (roll: string): boolean => {
    const rollNum = +roll;
    if (rollNum === 0) {
      toast({
        title: "Invalid Roll Number",
        description: "Please enter a valid roll number",
        variant: "destructive",
      });
      return false;
    }

    if (roll.length !== 5) {
      toast({
        title: "Invalid Roll Number Format",
        description: "Roll number must be exactly 5 digits",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const calculateUnpaidFine = (count: number): number => {
    if (count <= 3) return 0;
    return (count - 3) * 50; // 50 rupees for each time after 3rd late mark
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please log in to mark attendance",
        variant: "destructive",
      });
      return;
    }

    if (!validateRollNumber(rollNumber)) {
      return;
    }

    let newCount = 0;
    let unpaidFine = 0;

    try {
      setIsSubmitting(true);
      const roll = +rollNumber;
      const timestamp = serverTimestamp();

      // Get user's department from their document
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const userDept = userDoc.data()?.dept || "unknown";

      // Use transaction to ensure data consistency
      await runTransaction(db, async (transaction) => {
        // Get or create late-comer document
        const lateComersDocRef = doc(db, "late-comers", userDept);
        const lateComersDoc = await transaction.get(lateComersDocRef);
        const existingData = lateComersDoc.data() || {};
        const existingRollData = existingData[roll] || {};

        // Validate if student already marked today
        const today = new Date().toDateString();
        const lastMarkedDate = existingRollData.lastMarkedDate;
        if (lastMarkedDate === today) {
          throw new Error("Attendance already marked for today");
        }

        // Calculate new count and prepare timestamp field
        newCount = (existingRollData.count || 0) + 1;
        const timestampField = `L${newCount}`;

        // Calculate unpaid fine
        unpaidFine = calculateUnpaidFine(newCount);

        // Prepare data to save
        const lateComersData = {
          [roll]: {
            ...existingRollData,
            dept: userDept,
            count: newCount,
            uf: unpaidFine,
            pf: existingRollData.pf || 0,
            timestamps: {
              ...(existingRollData.timestamps || {}),
              [timestampField]: timestamp,
            },
            createdAt: existingRollData.createdAt || createdAt,
            lastMarkedDate: today,
            lastUpdated: timestamp,
          },
        };

        // Update late-comers collection
        transaction.set(lateComersDocRef, lateComersData, { merge: true });

        // Update archive collection
        const archiveMonth = `${userDept}_${month + 1}_${year}`;
        const archiveDocRef = doc(db, "archive", archiveMonth);
        const archiveDoc = await transaction.get(archiveDocRef);
        const existingArchiveData = archiveDoc.data() || {};
        const archiveRecord = existingArchiveData[roll] || {};

        const archiveData = {
          [roll]: {
            ...archiveRecord,
            rollNumber: roll.toString(),
            dept: userDept,
            count: newCount,
            uf: unpaidFine,
            pf: existingRollData.pf || 0,
            timestamps: {
              ...(archiveRecord.timestamps || {}),
              [timestampField]: timestamp,
            },
            createdAt: existingRollData.createdAt || createdAt,
            lastUpdated: timestamp,
            lastMarkedDate: today,
          },
        };

        // Update archive collection
        transaction.set(archiveDocRef, archiveData, { merge: true });
      });

      // Show appropriate toast message
      if (newCount > 3) {
        toast({
          title: "⚠️ Collect ID! Late comer",
          description: `Roll number ${roll} has been late ${newCount} times. Fine amount: ₹${unpaidFine}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Attendance Marked",
          description: `Roll number ${roll} marked as late (${newCount}/3)`,
        });
      }

      // Clear input and refocus
      setRollNumber("");
      inputRef.current?.focus();
    } catch (error: unknown) {
      console.error("Error marking attendance:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to mark attendance. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleSubmit();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          ref={inputRef}
          type="number"
          placeholder="Enter Roll Number (5 digits)"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          onKeyPress={handleKeyPress}
          className="text-lg p-6"
          disabled={isSubmitting}
          maxLength={5}
          min={0}
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !rollNumber}
        className="w-full py-6 text-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
          </>
        ) : (
          "Mark Late"
        )}
      </Button>
    </div>
  );
}
