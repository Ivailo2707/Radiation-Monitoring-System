# Radiation-Monitoring-System

Project goal definition:
    Web based application with the following functionalities:
        Continuously monitors radiation levels via Geiger counter connected to Raspberry Pi 5
        Provides real-time visualization of radiation data (μSv/h)
        Triggers both audible and visual alarms when certain thresholds are exceeded
        Stores historical data for analysis
        Secures access through user authentication

    Key objectives:
        Safety Monitoring: Immediate detection of dangerous radiation levels
        Data Recording: Long-term tracking of radiation exposure
        Access Control: Secure system access for authorized personnel
        Alert System: Immediate notification of hazards

Technical Stack
    Frontend: React.js
    Backend: Node.js/Express
    Database: MongoDB
    Hardware: RPi5 + Geiger counter
    Containerization: Docker
    Deployment: Terraform


User stories:
    Nuclear facility usage:
        Safety personel:
            "As a safety officer, I want to see current radiation levels in real-time so I can monitor facility safety"
            "As a supervisor, I want to receive audible alarms when radiation exceeds 5 μSv/h so I can initiate evacuation procedures"
            "As a technician, I want to view historical trends over the past 24 hours so I can identify patterns and improve safety"
    
        Maintenance personel:
            "As a system admin, I want to configure alarm thresholds so I can set appropriate safety levels"
            "As an admin, I want to manage user accounts so I can control system access"
    
    Domestic usage:
        General user:
            "As a user, I want to log in securely so I can access the monitoring dashboard"
            "As a user, I want to view data in different time ranges (hour/day/week) so I can analyze trends"
            "As a user, I want to feel safe in my environment and be ensured of a warning in case of nuclear fallout"

Use cases:
    Radiation monitoring:
        Actor: 
            Geiger counter hardware
        Flow:
            Sensor takes reading every second
            Data collected by Raspberry Pi
            Pi processes and sends to backend
            Backend stores in database
            Frontend displays current reading
    
    Threshold Alerting:
        Actor: 
            System
        Flow:
            System compares new reading to threshold
            If exceeded, triggers:
                Browser notification
                Audible alarm
                Dashboard visual alert
            Logs alert event
    
    User Authentication:
        Actor:
            Safety personnel
        Flow:
            User accesses login page
            Enters credentials
            System validates against database
            Grants access to dashboard
    
    Data Visualization:
        Actor:
            Authorized user
        Flow:
            User selects time range
            System queries database
            Returns formatted data
            Frontend renders chart

System architecture overview:
[Geiger Counter] → [RPi5 (Python)] → [Node.js Backend] → [MongoDB]
                                     ↑
[React Frontend] ←-------------------↓