@echo off
echo ======================================
echo   Importando base de datos MyGasolinera
echo ======================================

"C:\Program Files\MariaDB 12.0\bin\mysql.exe" -u root mygasolinera < mygasolinera.sql

echo.
echo Importación completada.
pause
