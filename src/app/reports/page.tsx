"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Upload } from "lucide-react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../firebase";
import ExcelJS from "exceljs";
import { Input } from "@/components/ui/input";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import Login from "@/components/Login";
import Loading from "@/components/Loading";

interface AttendanceRecord {
  rollNumber: string;
  count: number;
  createdAt: string;
  dept: string;
  paidAt?: string;
  paidFine: number;
  uf: number;
  timestamps: {
    L1?: string;
    L2?: string;
    L3?: string;
    L4?: string;
    L5?: string;
    L6?: string;
    L7?: string;
    L8?: string;
  };
}

interface ExcelRecord {
  RollNo: string;
  Name: string;
  Dept: string;
  Semister: string;
  // Add any additional fields from Google Sheet if needed
}

interface ExcelRow {
  [key: string]: string | number | null;
}

interface ExcelData {
  [key: number]: string | number | null;
  length: number;
}

interface ColumnMap {
  rollNo: string;
  name: string;
  semester: string;
}

// Add a helper function to format timestamps
function formatTimestamp(timestamp: any): string {
  if (!timestamp) return "-";
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleString();
  }
  return "-";
}

// Add a helper function to normalize roll numbers for comparison
function normalizeRollNumber(rollNumber: string): string {
  return String(rollNumber)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, ""); // Remove any special characters
}

export default function ReportsPage() {
  const { currentUser, loading } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [matchedRecords, setMatchedRecords] = useState<
    (AttendanceRecord & ExcelRecord)[]
  >([]);
  const [selectedDept, setSelectedDept] = useState<string>("placeholder");
  const [selectedSemester, setSelectedSemester] =
    useState<string>("placeholder");

  // Google Sheets URL
  const SPREADSHEET_URL =
    "https://docs.google.com/spreadsheets/d/1ALQWqADE8E3DBwIL3U-RaYg8vY-t-Yn1/edit?usp=sharing&ouid=117677212679251065100&rtpof=true&sd=true";

  const fetchRecords = async (month: string, year: string) => {
    setIsLoading(true);
    try {
      const formattedMonth = `${parseInt(month, 10)} ${year}`;
      const archiveRef = collection(db, "archive");

      // Get all documents from archive collection
      const snapshot = await getDocs(archiveRef);
      const allData: AttendanceRecord[] = [];

      // Process each department's document
      for (const doc of snapshot.docs) {
        const deptData = doc.data();

        // Convert document data to records and filter by createdAt
        Object.entries(deptData).forEach(
          ([rollNumber, record]: [string, any]) => {
            if (record.createdAt === formattedMonth) {
              allData.push({
                rollNumber,
                count: record.count,
                createdAt: record.createdAt,
                dept: record.dept,
                paidAt: record.paidAt,
                paidFine: record.pf || 0,
                uf: record.uf || 0,
                timestamps: record.timestamps || {},
              });
            }
          }
        );
      }

      // Sort by department and roll number
      const sortedData = allData.sort((a, b) => {
        if (a.dept !== b.dept) {
          return a.dept.localeCompare(b.dept);
        }
        return a.rollNumber.localeCompare(b.rollNumber);
      });

      setRecords(sortedData);

      if (sortedData.length === 0) {
        alert(`No records found for ${formattedMonth}.`);
      }

      return sortedData;
    } catch (error) {
      console.error("Error retrieving data:", error);
      alert("Failed to retrieve data. Please try again later.");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = async (value: string) => {
    setSelectedMonth(value);
    if (value && selectedYear) {
      await fetchRecords(value, selectedYear);
    }
  };

  const handleYearChange = async (value: string) => {
    setSelectedYear(value);
    if (selectedMonth && value) {
      await fetchRecords(selectedMonth, value);
    }
  };

  const processExcelFile = async () => {
    if (!records.length) return;

    setIsLoading(true);
    try {
      // Convert Google Spreadsheet URL to export URL
      const spreadsheetId = SPREADSHEET_URL.match(/\/d\/(.*?)(\/|$)/)?.[1];
      if (!spreadsheetId) {
        throw new Error("Invalid Google Spreadsheet link format");
      }

      // Create export URL for Excel format
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;

      console.log("Fetching spreadsheet from:", exportUrl);
      const response = await fetch(exportUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log(
        "File fetched successfully, size:",
        arrayBuffer.byteLength,
        "bytes"
      );

      // Read the Excel file using ExcelJS
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      // Get the first worksheet
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error("No worksheet found in the Excel file");
      }

      // Get headers from first row
      const headers = worksheet.getRow(1).values as string[];
      console.log("Headers found:", headers);

      // Find column indices
      const rollNoIndex = headers.findIndex(
        (header) => String(header).toLowerCase().trim() === "rollno"
      );
      const nameIndex = headers.findIndex(
        (header) => String(header).toLowerCase().trim() === "name"
      );
      const deptIndex = headers.findIndex(
        (header) => String(header).toLowerCase().trim() === "dept"
      );
      const semesterIndex = headers.findIndex(
        (header) => String(header).toLowerCase().trim() === "semister"
      );

      console.log("Column indices:", {
        rollNoIndex,
        nameIndex,
        deptIndex,
        semesterIndex,
      });

      if (
        rollNoIndex === -1 ||
        nameIndex === -1 ||
        deptIndex === -1 ||
        semesterIndex === -1
      ) {
        throw new Error(
          `Could not find required columns. Headers must be exactly "RollNo", "Name", "Dept" and "Semister". Found: ${headers.join(
            ", "
          )}`
        );
      }

      // Convert worksheet to JSON
      const normalizedData: ExcelRecord[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        const rollNo = row.getCell(rollNoIndex).value;
        const name = row.getCell(nameIndex).value;
        const dept = row.getCell(deptIndex).value;
        const semister = row.getCell(semesterIndex).value;

        // console.log(`Processing row ${rowNumber}:`, {
        //   rollNo,
        //   name,
        //   dept,
        //   semister,
        // });

        if (!rollNo || !name || !dept || !semister) {
          console.warn(`Row ${rowNumber} has missing data:`, {
            rollNo,
            name,
            dept,
            semister,
          });
          return;
        }

        normalizedData.push({
          RollNo: String(rollNo).trim(),
          Name: String(name).trim(),
          Dept: String(dept).trim(),
          Semister: String(semister).trim(),
        });
      });

      // console.log("Normalized data:", normalizedData);

      if (normalizedData.length === 0) {
        throw new Error("No valid data rows found in Spreadsheet");
      }

      // Match records with better error handling
      const matched = records.map((record) => {
        const excelRecord = normalizedData.find(
          (excel) =>
            String(excel.RollNo).toLowerCase().trim() ===
            String(record.rollNumber).toLowerCase().trim()
        );

        if (excelRecord) {
          return {
            ...record,
            dept: excelRecord.Dept, // Use department from Excel
            RollNo: excelRecord.RollNo,
            Name: excelRecord.Name,
            Dept: excelRecord.Dept,
            Semister: excelRecord.Semister,
          } as AttendanceRecord & ExcelRecord;
        }

        // If no match found, create a compatible record
        return {
          ...record,
          RollNo: record.rollNumber,
          Name: "N/A",
          Dept: record.dept,
          Semister: "N/A",
        } as AttendanceRecord & ExcelRecord;
      });

      console.log("Total matches found:", matched.length);
      setMatchedRecords(matched);

      if (matched.length === 0) {
        alert(`No matching records found. Please check if:
1. The Spreadsheet has these exact column names: "RollNo", "Name", "Dept", "Semister"
2. Roll numbers in Spreadsheet match the database format exactly
3. Data is present in all columns

Found headers: ${headers.join(", ")}`);
      } else {
        alert(`Successfully matched ${matched.length} records!`);
      }
    } catch (error) {
      console.error("Error processing Excel file:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to process Excel file. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedMonth || !getFilteredData().length) return;
    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Attendance");
      worksheet.columns = [
        { header: "RollNo", key: "RollNo", width: 15 },
        { header: "Name", key: "Name", width: 30 },
        { header: "Dept", key: "Dept", width: 15 },
        { header: "Semister", key: "Semister", width: 15 },
        { header: "L1", key: "L1", width: 20 },
        { header: "L2", key: "L2", width: 20 },
        { header: "L3", key: "L3", width: 20 },
        { header: "L4", key: "L4", width: 20 },
        { header: "L5", key: "L5", width: 20 },
        { header: "L6", key: "L6", width: 20 },
        { header: "L7", key: "L7", width: 20 },
        { header: "L8", key: "L8", width: 20 },
        { header: "Paid Fine", key: "Paid Fine", width: 15 },
        { header: "Unpaid Fine", key: "Unpaid Fine", width: 15 },
        { header: "Paid at", key: "Paid at", width: 20 },
      ];
      // Add only filtered data
      const dataToExport = getFilteredData().map((record: any) => ({
        RollNo: record.rollNumber,
        Name: getField(record, "Name"),
        Dept: getField(record, "Dept"),
        Semister: getField(record, "Semister"),
        L1: formatTimestamp(record.timestamps?.L1),
        L2: formatTimestamp(record.timestamps?.L2),
        L3: formatTimestamp(record.timestamps?.L3),
        L4: formatTimestamp(record.timestamps?.L4),
        L5: formatTimestamp(record.timestamps?.L5),
        L6: formatTimestamp(record.timestamps?.L6),
        L7: formatTimestamp(record.timestamps?.L7),
        L8: formatTimestamp(record.timestamps?.L8),
        "Paid Fine": `₹${record.paidFine}`,
        "Unpaid Fine": `₹${record.uf || 0}`,
        "Paid at": formatTimestamp(record.paidAt),
      }));

      worksheet.addRows(dataToExport);

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Attendance_${selectedMonth}_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert(
        `Excel file has been downloaded for ${selectedMonth} ${selectedYear}.`
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again later.");
    }
  };

  // Helper to get a field from a record, case-insensitive
  function getField(record: any, key: string) {
    return (
      record[key] ||
      record[key.toLowerCase()] ||
      record[key.charAt(0).toUpperCase() + key.slice(1)] ||
      ""
    );
  }

  // Filtered data based on department and semester
  const getFilteredData = () => {
    if (selectedDept === "placeholder" || selectedSemester === "placeholder")
      return [];
    const data = matchedRecords;
    return data.filter((record: any) => {
      const dept = (
        getField(record, "Dept") || getField(record, "dept")
      ).toUpperCase();
      const sem = String(
        getField(record, "Semister") || getField(record, "semister")
      );
      return dept === selectedDept && sem === selectedSemester;
    });
  };

  const currentYear = new Date().getFullYear();

  if (loading) {
    return <Loading />;
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Late Comers Report</CardTitle>
          <CardDescription>
            View and download late comers reports by month and year. The system
            will match records with the master Spreadsheet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <Select onValueChange={handleMonthChange} value={selectedMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      return (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2000, i).toLocaleString("default", {
                            month: "long",
                          })}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Select onValueChange={handleYearChange} value={selectedYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => {
                      const year = 2025 + i; // Starting from 2025 up to 2035
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={processExcelFile}
                  disabled={isLoading || !records.length}
                  className="flex-1 sm:flex-none whitespace-nowrap"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Process Sheet
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={
                    selectedDept === "placeholder" ||
                    selectedSemester === "placeholder" ||
                    !getFilteredData().length
                  }
                  className="flex-1 sm:flex-none whitespace-nowrap"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            {/* Only show these filters after spreadsheet is processed */}
            {matchedRecords.length > 0 && (
              <div className="flex gap-2 w-full sm:w-auto items-center">
                <Select onValueChange={setSelectedDept} value={selectedDept}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select Dept" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Select Dept
                    </SelectItem>
                    <SelectItem value="AN">AN</SelectItem>
                    <SelectItem value="TE">TE</SelectItem>
                    <SelectItem value="ME">ME</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="AE">AE</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={setSelectedSemester}
                  value={selectedSemester}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select Sem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Select Sem
                    </SelectItem>
                    {Array.from({ length: 6 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Only show table if both filters are selected and there is filtered data */}
            {matchedRecords.length > 0 &&
              selectedDept !== "placeholder" &&
              selectedSemester !== "placeholder" &&
              getFilteredData().length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Records Preview</CardTitle>
                    <CardDescription>
                      Showing {getFilteredData().length} records for Dept:{" "}
                      {selectedDept}, Sem: {selectedSemester}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>RollNo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Dept</TableHead>
                            <TableHead>Semister</TableHead>
                            <TableHead>L1</TableHead>
                            <TableHead>L2</TableHead>
                            <TableHead>L3</TableHead>
                            <TableHead>L4</TableHead>
                            <TableHead>L5</TableHead>
                            <TableHead>L6</TableHead>
                            <TableHead>L7</TableHead>
                            <TableHead>L8</TableHead>
                            <TableHead>Paid Fine</TableHead>
                            <TableHead>Unpaid Fine</TableHead>
                            <TableHead>Paid at</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredData().map((record: any) => (
                            <TableRow key={record.rollNumber}>
                              <TableCell>{record.rollNumber}</TableCell>
                              <TableCell>{getField(record, "Name")}</TableCell>
                              <TableCell>{getField(record, "Dept")}</TableCell>
                              <TableCell>
                                {getField(record, "Semister")}
                              </TableCell>
                              <TableCell>
                                {formatTimestamp(record.timestamps?.L1)}
                              </TableCell>
                              <TableCell>
                                {formatTimestamp(record.timestamps?.L2)}
                              </TableCell>
                              <TableCell>
                                {formatTimestamp(record.timestamps?.L3)}
                              </TableCell>
                              <TableCell>
                                {formatTimestamp(record.timestamps?.L4)}
                              </TableCell>
                              <TableCell>
                                {formatTimestamp(record.timestamps?.L5)}
                              </TableCell>
                              <TableCell>
                                {formatTimestamp(record.timestamps?.L6)}
                              </TableCell>
                              <TableCell>
                                {formatTimestamp(record.timestamps?.L7)}
                              </TableCell>
                              <TableCell>
                                {formatTimestamp(record.timestamps?.L8)}
                              </TableCell>
                              <TableCell>₹{record.paidFine}</TableCell>
                              <TableCell>₹{record.uf || 0}</TableCell>
                              <TableCell>
                                {formatTimestamp(record.paidAt)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
