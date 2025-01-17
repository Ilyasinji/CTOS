# Traffic System Diagrams

## Table of Contents
1. [System Flowchart](#system-flowchart)
2. [ERD (Entity Relationship Diagram)](#erd)
3. [Frontend Component Diagram](#frontend-component-diagram)
4. [Sequence Diagrams](#sequence-diagrams)
5. [Architecture Diagram](#architecture-diagram)

## System Flowchart

```mermaid
flowchart TD
    A[Start] --> B{User Login}
    B -->|Success| C[Dashboard]
    B -->|Failure| D[Error Message]
    D --> B
    
    C --> E{User Role}
    
    %% Super Admin Flow
    E -->|Super Admin| F[Admin Dashboard]
    F --> G[Manage Users]
    F --> H[View Analytics]
    F --> I[System Settings]
    F --> FA[Audit Logs]
    F --> FB[Override Controls]
    
    %% Traffic Officer Flow
    E -->|Officer| J[Officer Dashboard]
    J --> K[Record Offense]
    J --> L[Process Payment]
    J --> M[Generate Report]
    J --> JA[View Statistics]
    J --> JB[Handle Queries]
    
    %% Driver Flow
    E -->|Driver| N[Driver Dashboard]
    N --> O[View Offenses]
    N --> P[Make Payment]
    N --> Q[View History]
    N --> NA[Track Status]
    N --> NB[Download Reports]
    
    %% Payment Process
    P --> R{Payment Method}
    R -->|Cash| S[Cash Payment]
    R -->|Mobile Money| T[Mobile Payment]
    R -->|Card| TC[Card Payment]
    S --> U[Generate Receipt]
    T --> U
    TC --> U
    
    %% Profile Management
    C --> Y[Profile Settings]
    Y --> Z[Update Profile]
    Y --> AA[Change Password]
    Y --> AB[Upload Image]
```

## ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    USER ||--o{ OFFENSE : records
    USER ||--o{ PAYMENT : processes
    USER {
        string _id PK
        string name
        string email
        string password
        string role
        string profileImage
        boolean isActive
        boolean twoFactorEnabled
        datetime lastLogin
        datetime createdAt
        datetime updatedAt
    }
    
    DRIVER ||--o{ OFFENSE : receives
    DRIVER ||--o{ PAYMENT : makes
    DRIVER {
        string _id PK
        string userId FK
        string name
        string licenseNumber
        string contact
        string vehicleInfo
        boolean isBlacklisted
        datetime createdAt
        datetime updatedAt
    }
    
    OFFENSE ||--o{ PAYMENT : has
    OFFENSE {
        string _id PK
        string driverId FK
        string officerId FK
        string type
        number amount
        string location
        string evidence
        string status
        datetime offenseDate
        datetime createdAt
    }
    
    PAYMENT {
        string _id PK
        string offenseId FK
        string driverId FK
        string officerId FK
        number amount
        string method
        string status
        string reference
        datetime paidAt
        datetime createdAt
    }
```

## Frontend Component Diagram

```mermaid
graph TD
    A[App] --> B[Router]
    B --> C[Layout]
    
    C --> D[Sidebar]
    C --> E[Header]
    C --> F[Main Content]
    
    F --> G[Dashboard]
    F --> H[Profile]
    F --> I[Offenses]
    F --> J[Payments]
    F --> K[Reports]
    F --> L[Settings]
    
    G --> M[StatCards]
    G --> N[RecentActivity]
    G --> O[Charts]
    
    I --> P[OffenseList]
    I --> Q[OffenseForm]
    I --> R[OffenseDetails]
    
    J --> S[PaymentList]
    J --> T[PaymentForm]
    J --> U[PaymentReceipt]
    
    K --> V[ReportFilters]
    K --> W[ReportTable]
    K --> X[ExportOptions]
    
    H --> Y[ProfileForm]
    H --> Z[PasswordForm]
    H --> AA[ImageUpload]
```

## Sequence Diagrams

### Login Process
```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant AuthAPI
    participant Database
    
    User->>Frontend: Enter Credentials
    Frontend->>AuthAPI: POST /api/auth/login
    AuthAPI->>Database: Verify Credentials
    Database-->>AuthAPI: User Data
    AuthAPI-->>Frontend: JWT Token
    Frontend->>Frontend: Store Token
    Frontend-->>User: Redirect to Dashboard
```

### Record Offense Process
```mermaid
sequenceDiagram
    actor Officer
    participant Frontend
    participant OffenseAPI
    participant Database
    participant NotificationService
    
    Officer->>Frontend: Fill Offense Form
    Frontend->>OffenseAPI: POST /api/offenses
    OffenseAPI->>Database: Save Offense
    Database-->>OffenseAPI: Offense Data
    OffenseAPI->>NotificationService: Send Notification
    NotificationService->>Database: Save Notification
    OffenseAPI-->>Frontend: Success Response
    Frontend-->>Officer: Show Success Message
```

### Payment Process
```mermaid
sequenceDiagram
    actor Driver
    participant Frontend
    participant PaymentAPI
    participant PaymentGateway
    participant Database
    
    Driver->>Frontend: Select Payment Method
    Frontend->>PaymentAPI: POST /api/payments
    PaymentAPI->>PaymentGateway: Process Payment
    PaymentGateway-->>PaymentAPI: Payment Status
    PaymentAPI->>Database: Update Payment Status
    Database-->>PaymentAPI: Updated Data
    PaymentAPI-->>Frontend: Success Response
    Frontend-->>Driver: Show Receipt
```

## Architecture Diagram

```mermaid
graph TB
    subgraph Client Layer
        A[Web Browser]
        B[Mobile App]
    end
    
    subgraph Frontend Layer
        C[React Application]
        D[State Management]
        E[UI Components]
    end
    
    subgraph API Layer
        F[Express Server]
        G[Authentication]
        H[Routes]
        I[Controllers]
    end
    
    subgraph Service Layer
        J[Business Logic]
        K[Validation]
        L[File Handling]
    end
    
    subgraph Data Layer
        M[MongoDB]
        N[File Storage]
    end
    
    subgraph External Services
        O[Payment Gateway]
        P[Email Service]
        Q[SMS Service]
    end
    
    A --> C
    B --> C
    C --> D
    C --> E
    D --> F
    E --> F
    F --> G
    F --> H
    H --> I
    I --> J
    J --> K
    J --> L
    K --> M
    L --> N
    J --> O
    J --> P
    J --> Q
```

Note: These diagrams are written in Mermaid markdown syntax. To view them properly, you'll need a markdown viewer that supports Mermaid diagrams (like GitHub, VS Code with Mermaid extension, or other Mermaid-compatible viewers).

The diagrams provide a comprehensive visual representation of your Traffic System including:
1. System workflow from start to end
2. Database relationships and structure
3. Frontend component hierarchy and relationships
4. Key system processes like login, offense recording, and payment
5. Overall system architecture and how different components interact

Would you like me to explain any specific diagram in more detail or make any adjustments?
