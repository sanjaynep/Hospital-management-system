# Hospital Management System

A comprehensive full-stack hospital management application built with **JavaScript**, **Python**, **HTML**, and **CSS**. This system provides essential features for managing hospital operations including patient records, doctor schedules, appointments, and medical records.

## 🏥 Project Overview

This Hospital Management System is designed to streamline hospital operations by providing:
- **Patient Management**: Register and maintain patient records
- **Doctor Management**: Manage doctor profiles and schedules
- **Appointment Scheduling**: Book and manage patient appointments
- **Medical Records**: Store and retrieve patient medical history
- **User Authentication**: Secure login for different user roles
- **Background Tasks**: Async processing with Celery
- **Caching**: Redis for performance optimization

## 📊 Technology Stack

| Technology | Usage | Percentage |
|------------|-------|-----------|
| **JavaScript** | Frontend interactivity & backend logic | 41.9% |
| **Python** | Backend server & business logic | 34.9% |
| **CSS** | User interface styling | 20.9% |
| **HTML** | Frontend markup & structure | 2.3% |

### Backend Services:
- **Django**: Web framework
- **Redis**: Caching & message broker
- **Celery**: Async task queue
- **PostgreSQL/SQLite**: Database

## 📁 Project Structure

```
Hospital-management-system/
├── backend/                        # Python Django backend
│   └── system/
│       ├── dockerfile              # Docker configuration
│       ├── docker-compose.yml       # Docker Compose configuration
│       ├── requirements.txt         # Python dependencies
│       ├── manage.py               # Django management
│       ├── models/                 # Database models
│       ├── routes/                 # API endpoints
│       └── ...
├── frontend/                       # JavaScript frontend
│   ├── static/                     # CSS and assets
│   ├── templates/                  # HTML templates
│   └── ...
├── TEST_IMPROVEMENTS.md            # Testing refactoring documentation
└── README.md                       # This file
```

## 🚀 Quick Start with Docker (Recommended ⭐)

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- Git

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone https://github.com/sanjaynep/Hospital-management-system.git
   cd Hospital-management-system
   ```

2. **Configure environment variables**
   ```bash
   # Create .env file in backend/system directory
   cp backend/system/.env.example backend/system/.env  # if available
   # OR create it manually with necessary variables
   ```

3. **Start all services with Docker Compose**
   ```bash
   docker-compose -f backend/system/docker-compose.yml up -d
   ```

   This will start:
   - **Django Server**: http://localhost:8000
   - **Redis**: Port 6379 (internal)
   - **Celery Worker**: Background tasks
   - **Celery Beat**: Scheduled tasks

4. **View running containers**
   ```bash
   docker-compose -f backend/system/docker-compose.yml ps
   ```

5. **Stop all services**
   ```bash
   docker-compose -f backend/system/docker-compose.yml down
   ```

### Docker Compose Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **redis** | redis:latest | 6379 | Caching & message broker |
| **djangoproject** | django-img | 8000 | Main Django web server |
| **celery** | django-img | - | Background task worker |
| **celery-beat** | django-img | - | Scheduled task scheduler |

### Docker Commands Reference

```bash
# Start services in background (detached mode)
docker-compose -f backend/system/docker-compose.yml up -d

# View logs from all services
docker-compose -f backend/system/docker-compose.yml logs -f

# View logs for specific service
docker-compose -f backend/system/docker-compose.yml logs -f djangoproject

# Follow logs in real-time
docker-compose -f backend/system/docker-compose.yml logs -f

# Stop services
docker-compose -f backend/system/docker-compose.yml down

# Stop and remove volumes (careful: deletes data!)
docker-compose -f backend/system/docker-compose.yml down -v

# Restart services
docker-compose -f backend/system/docker-compose.yml restart

# Execute commands in running container
docker-compose -f backend/system/docker-compose.yml exec djangoproject python manage.py createsuperuser

# Build images without caching
docker-compose -f backend/system/docker-compose.yml build --no-cache

# View resource usage
docker-compose -f backend/system/docker-compose.yml stats

# Scale services
docker-compose -f backend/system/docker-compose.yml up -d --scale celery=3
```

### Common Docker Troubleshooting

```bash
# Check if containers are running
docker-compose -f backend/system/docker-compose.yml ps

# View detailed logs for debugging
docker-compose -f backend/system/docker-compose.yml logs --tail=100

# Remove all containers and volumes (clean start)
docker-compose -f backend/system/docker-compose.yml down -v
docker-compose -f backend/system/docker-compose.yml up -d

# Rebuild images if changes were made
docker-compose -f backend/system/docker-compose.yml build
docker-compose -f backend/system/docker-compose.yml up -d
```

---

## 🔧 Manual Setup (Without Docker)

### Prerequisites

- Python 3.8+
- Node.js (if needed for frontend dependencies)
- Redis server running locally
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sanjaynep/Hospital-management-system.git
   cd Hospital-management-system
   ```

2. **Set up the Backend**
   ```bash
   cd backend/system
   
   # Create a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run migrations
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Set up the Frontend**
   ```bash
   cd ../../frontend
   # Install any dependencies if needed
   npm install  # or yarn install
   ```

4. **Start Services**
   ```bash
   # Terminal 1: Backend Django Server
   cd backend/system
   python manage.py runserver 0.0.0.0:8000
   
   # Terminal 2: Celery Worker
   cd backend/system
   python -m celery -A system worker --loglevel=info
   
   # Terminal 3: Celery Beat
   cd backend/system
   python -m celery -A system beat --loglevel=info
   
   # Terminal 4: Redis (if not running)
   redis-server
   
   # Terminal 5: Frontend
   cd frontend
   # Serve using your preferred method
   ```

The application should now be accessible at `http://localhost:8000`

---

## 📚 Features

### Core Functionality

- **User Management**
  - Role-based access control (Admin, Doctor, Patient)
  - Secure user registration and authentication
  - Profile management

- **Patient Module**
  - Patient registration and profile management
  - Medical history tracking
  - Contact information storage
  - Insurance details

- **Doctor Module**
  - Doctor profile and specialization
  - Schedule management
  - Availability tracking
  - Appointment handling

- **Appointment System**
  - Schedule appointments with available doctors
  - Appointment status tracking
  - Appointment notifications
  - Prevent double-booking

- **Medical Records**
  - Store patient medical history
  - Prescription tracking
  - Treatment records
  - Report generation

- **Background Processing**
  - Celery for async tasks
  - Scheduled tasks with Celery Beat
  - Email notifications
  - Report generation

## 🧪 Testing

The project follows comprehensive unit testing best practices. See [TEST_IMPROVEMENTS.md](./TEST_IMPROVEMENTS.md) for detailed information about the testing strategy.

### Running Tests

**With Docker:**
```bash
# Run all tests
docker-compose -f backend/system/docker-compose.yml exec djangoproject python manage.py test core.tests.test_model

# Run specific test class
docker-compose -f backend/system/docker-compose.yml exec djangoproject python manage.py test core.tests.test_model.UserModelCreationTest

# Run with verbose output
docker-compose -f backend/system/docker-compose.yml exec djangoproject python manage.py test core.tests.test_model -v 2
```

**Without Docker:**
```bash
# Run all tests
python manage.py test core.tests.test_model

# Run specific test class
python manage.py test core.tests.test_model.UserModelCreationTest

# Run with verbose output
python manage.py test core.tests.test_model -v 2
```

## 📋 Database Models

### Key Models:
- **User**: Core user model with roles (Patient, Doctor, Admin)
- **Patient**: Extended patient information
- **Doctor**: Doctor-specific information and specializations
- **Appointment**: Appointment scheduling and management
- **MedicalRecord**: Patient medical history and treatment records

## 🔐 Security Features

- Password hashing and validation
- Role-based access control (RBAC)
- CSRF protection
- Input validation and sanitization
- Secure session management
- Environment variable protection for sensitive data
- Containerized security with Docker

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Documentation

### Sample Endpoints

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/patients/` - List all patients
- `POST /api/appointments/` - Create appointment
- `GET /api/doctors/` - List all doctors
- `GET /api/medical-records/<patient_id>/` - Get patient medical records

For complete API documentation, refer to the backend API specification.

## 🐛 Known Issues & TODOs

- [ ] Enhanced reporting features
- [ ] Email notification system
- [ ] SMS alerts for appointments
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Frontend documentation

## 📄 License

This project is open source. Please see the LICENSE file for details.

## 📧 Contact & Support

For questions or support, please reach out to the project maintainer:

- **GitHub**: [@sanjaynep](https://github.com/sanjaynep)
- **Repository**: [Hospital-management-system](https://github.com/sanjaynep/Hospital-management-system)

## 🙏 Acknowledgments

- Thanks to all contributors
- Built with modern web technologies
- Inspired by best practices in hospital management systems
- Docker containerization for easy deployment and consistency

---

**Last Updated**: June 2026
