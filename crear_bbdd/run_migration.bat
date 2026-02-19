@echo off
echo Running migration...
"C:\Program Files\MariaDB 12.0\bin\mysql.exe" -u root mygasolinera < crear_bbdd\migration_spatial_index.sql
echo Done.
