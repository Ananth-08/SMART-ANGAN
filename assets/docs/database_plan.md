# SMART-ANGAN: SQLite Database Architecture

This document outlines the database plan for local storage of student records, including the specialized ID generation logic.

## 1. Table: `students`

This is the primary table storing all student-related data.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, auto-increment |
| `student_id` | `TEXT` | Unique Generated ID (e.g., SA-EA-0001) |
| `first_name` | `TEXT` | Required |
| `last_name` | `TEXT` | Required |
| `dob` | `TEXT` | ISO 8601 string (YYYY-MM-DD) |
| `gender` | `TEXT` | Male / Female / Other |
| `profile_image` | `TEXT` | Local URI or Base64 |
| **Communication** | | |
| `door_number` | `TEXT` | |
| `street` | `TEXT` | |
| `village` | `TEXT` | |
| `zone` | `TEXT` | |
| `city` | `TEXT` | |
| `state` | `TEXT` | |
| `pincode` | `TEXT` | |
| **Guardian: Father** | | |
| `father_name` | `TEXT` | |
| `father_mobile` | `TEXT` | |
| `father_dob` | `TEXT` | |
| `father_aadhar` | `TEXT` | |
| **Guardian: Mother** | | |
| `mother_name` | `TEXT` | |
| `mother_mobile` | `TEXT` | |
| `mother_dob` | `TEXT` | |
| `mother_aadhar` | `TEXT` | |
| **Emergency** | | |
| `emergency_contact`| `TEXT` | |
| **Metadata** | | |
| `qr_code_data` | `TEXT` | Same as `student_id` |
| `month_code` | `TEXT` | Current month char (e.g., 'E' for May) |
| `year_code` | `TEXT` | Current year char (e.g., 'A' for 2026) |
| `serial_number` | `INTEGER`| Monthly reset counter |
| `created_at` | `DATETIME`| Default CURRENT_TIMESTAMP |

## 2. Student ID Generation Logic

The ID follows the format: `SA-[MonthCode][YearCode]-[Serial]`

### Month Codes
| Month | Code |
| :--- | :--- |
| Jan - April | A, B, C, D |
| **May** | **E** |
| ... | ... |
| Dec | L |

### Year Codes (Base 2026)
| Year | Code |
| :--- | :--- |
| **2026** | **A** |
| 2027 | B |
| ... | ... |

### Serial Logic
- Before every insert, the system queries the latest `serial_number` for the current `month_code` and `year_code`.
- If no record exists for the current month/year, the serial starts at `0001`.
- Otherwise, it increments the latest serial by 1.

## 3. CRUD Flow
1. **CREATE**: Validate form -> Generate Student ID -> Insert to SQLite -> Generate QR.
2. **READ**: Query all students (sorted by `created_at` DESC).
3. **UPDATE**: Modify details using `id` as reference.
4. **DELETE**: Hard delete or soft delete (optional).
