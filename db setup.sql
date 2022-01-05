CREATE DATABASE ISPYD;
USE ISPYD;

CREATE TABLE Images (
    ID int NOT NULL,
    Path varchar(255) NOT NULL,
    Annotation_complete binary,
    PRIMARY KEY (ID)
);

CREATE TABLE Users (
    ID int NOT NULL,
    name varchar(255) NOT NULL,
    email varchar(100),
    password varchar(100),
    PRIMARY KEY (ID)
);

CREATE TABLE Annotations (
    ID int NOT NULL,
    label varchar(255) NOT NULL,
    x int not null,
    y int not null,
    height int not null,
    width int not null,
    image_id int,
    user_id int,
    PRIMARY KEY (ID),
    FOREIGN KEY (image_id) REFERENCES Images(ID),
    FOREIGN KEY (user_id) REFERENCES Users(ID)
);