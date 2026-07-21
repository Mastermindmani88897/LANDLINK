@echo off
echo Starting LandLink AI Backend and Frontend...
start "LandLink Backend" cmd /k "cd backend && npm run dev"
start "LandLink Frontend" cmd /k "cd frontend && npm run dev"
