USE medilab_db;

ALTER TABLE bookings 
ADD COLUMN age INT AFTER patient_phone,
ADD COLUMN gender VARCHAR(10) AFTER age,
ADD COLUMN address TEXT AFTER gender;

ALTER TABLE bookings MODIFY COLUMN test_type TEXT NOT NULL;
