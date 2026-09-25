# Inventory Management System (IMS)

A full-stack inventory management system built with FastAPI backend and React frontend. This system provides comprehensive inventory tracking, user management, role-based access control, and notifications.

## Features

- **User Management**: Authentication, authorization, and role-based access control
- **Inventory Management**: Add, edit, delete, and track inventory items
- **Category Management**: Organize items by categories
- **Supplier Management**: Manage supplier information
- **Stock Transactions**: Track stock in/out with transaction history
- **Notifications**: Real-time notifications for low stock and other events
- **Media Upload**: Image support for inventory items
- **Responsive UI**: Modern, mobile-friendly interface built with React and Tailwind CSS

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for Python
- **PostgreSQL**: Primary database
- **SQLAlchemy**: ORM for database operations
- **Alembic**: Database migration tool
- **Pydantic**: Data validation and serialization
- **Passlib**: Password hashing
- **APScheduler**: Task scheduling

### Frontend
- **React 19**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **React Router**: Client-side routing

## Prerequisites

- **Python 3.12+**
- **Node.js 18+**
- **PostgreSQL 12+**
- **Git**

## Installation

### Windows

#### 1. Install Prerequisites

**Python:**
1. Download Python 3.12+ from [python.org](https://www.python.org/downloads/)
2. During installation, check "Add Python to PATH"
3. Verify installation:
   ```cmd
   python --version
   pip --version
   ```

**Node.js:**
1. Download Node.js 18+ from [nodejs.org](https://nodejs.org/)
2. Install with default settings
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

**PostgreSQL:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with default settings (remember the password for `postgres` user)
3. Add PostgreSQL bin directory to PATH
4. Verify installation:
   ```cmd
   psql --version
   ```

**Git:**
1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Install with default settings

#### 2. Clone Repository
```cmd
git clone <repository-url>
cd ims-project
```

#### 3. Backend Setup
```cmd
cd ims-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -e .

# Create PostgreSQL database
createdb -U postgres ims_db

# Set environment variables (create .env file)
echo DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ims_db > .env
echo SECRET_KEY=your_secret_key_here >> .env

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload
```

#### 4. Frontend Setup
```cmd
# Open new terminal and navigate to frontend
cd ims-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### macOS

#### 1. Install Prerequisites

**Using Homebrew (recommended):**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install prerequisites
brew install python@3.12 node postgresql git

# Start PostgreSQL service
brew services start postgresql
```

**Manual Installation:**
- Python: Download from [python.org](https://www.python.org/downloads/)
- Node.js: Download from [nodejs.org](https://nodejs.org/)
- PostgreSQL: Download from [postgresql.org](https://www.postgresql.org/download/macosx/)

#### 2. Clone Repository
```bash
git clone <repository-url>
cd ims-project
```

#### 3. Backend Setup
```bash
cd ims-backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -e .

# Create PostgreSQL database
createdb ims_db

# Set environment variables (create .env file)
cat > .env << EOF
DATABASE_URL=postgresql://$(whoami)@localhost:5432/ims_db
SECRET_KEY=your_secret_key_here
EOF

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload
```

#### 4. Frontend Setup
```bash
# Open new terminal and navigate to frontend
cd ims-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Linux (Ubuntu/Debian)

#### 1. Install Prerequisites
```bash
# Update package list
sudo apt update

# Install Python, Node.js, PostgreSQL, and Git
sudo apt install python3.12 python3.12-venv python3-pip nodejs npm postgresql postgresql-contrib git

# Install latest Node.js (optional, for newer version)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. Setup PostgreSQL
```bash
# Switch to postgres user and create database
sudo -u postgres psql -c "CREATE DATABASE ims_db;"
sudo -u postgres psql -c "CREATE USER ims_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ims_db TO ims_user;"
```

#### 3. Clone Repository
```bash
git clone <repository-url>
cd ims-project
```

#### 4. Backend Setup
```bash
cd ims-backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -e .

# Set environment variables (create .env file)
cat > .env << EOF
DATABASE_URL=postgresql://ims_user:your_password@localhost:5432/ims_db
SECRET_KEY=your_secret_key_here
EOF

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload
```

#### 5. Frontend Setup
```bash
# Open new terminal and navigate to frontend
cd ims-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Configuration

### Environment Variables

Create a `.env` file in the `ims-backend` directory with the following variables:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/ims_db
SECRET_KEY=your_secret_key_here_make_it_long_and_random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Database Setup

The application will automatically create the necessary tables on first run. For production deployments, use Alembic migrations:

```bash
# Generate new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

## Running the Application

### Development Mode

1. **Start Backend:**
   ```bash
   cd ims-backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   uvicorn app.main:app --reload
   ```
   Backend will be available at: http://localhost:8000

2. **Start Frontend:**
   ```bash
   cd ims-frontend
   npm run dev
   ```
   Frontend will be available at: http://localhost:5173

### Production Mode

1. **Build Frontend:**
   ```bash
   cd ims-frontend
   npm run build
   ```

2. **Run Backend:**
   ```bash
   cd ims-backend
   source venv/bin/activate
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

## API Documentation

Once the backend is running, you can access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
ims-project/
├── ims-backend/
│   ├── app/
│   │   ├── routers/          # API route handlers
│   │   ├── services/         # Business logic
│   │   ├── scripts/          # Utility scripts
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Database connection
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   └── main.py          # FastAPI application
│   ├── alembic/             # Database migrations
│   ├── media/               # Uploaded files
│   └── pyproject.toml       # Python dependencies
├── ims-frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   └── package.json         # Node.js dependencies
└── README.md
```

## Default Credentials

The system creates a default admin user:
- **Username**: admin
- **Password**: admin123

**Important**: Change these credentials immediately after first login.

## Common Issues & Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env` file
- Verify database exists and user has proper permissions

### Port Conflicts
- Backend default port: 8000
- Frontend default port: 5173
- Change ports if they're already in use

### Permission Issues (Linux/macOS)
```bash
# Fix permission issues
sudo chown -R $USER:$USER /path/to/ims-project
```

### Python Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -e .
```

## Development

### Adding New Features
1. Create new models in `models.py`
2. Create corresponding schemas in `schemas.py`
3. Add CRUD operations in `crud.py`
4. Create API routes in `routers/`
5. Generate and apply migrations with Alembic

### Testing
```bash
# Backend tests (if implemented)
cd ims-backend
python -m pytest

# Frontend tests
cd ims-frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.