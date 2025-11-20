@echo off
echo ======================================
echo   Importando base de datos MyGasolinera
echo ======================================

"C:\Program Files\MariaDB 12.0\bin\mariadb.exe" -u root mygasolinera < mygasolinera.sql

echo.
echo Importación completada.
pause
