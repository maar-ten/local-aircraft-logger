# Local Aircraft Logger
[Dump1090](https://github.com/antirez/dump1090) is used to decode aircraft messages from a [RTL-SDR](https://www.rtl-sdr.com/) radio.

The software comes with a little web application where passing aircrafts are plotted onto a geographical map.

Using the data of that application together with some magic of [Leaflet](https://leafletjs.com/), you can create your own mapping application.

This docker application stores the path and details of aircrafts that fly below 1500 ft (450 m). These are usually helicopters and not airplanes. It also shows but does not store the paths and details of any aircraft that the radio picks up.

## Here's what you need
To get going with the project you need to install Docker on a computer that is connected to a RTL-SDR device (radio).

A Raspberry Pi from 2015 with 1GB of memory suffices to run this application.

### 1. Install docker
`curl -sSL https://get.docker.com | sh`

### 2. Start dump1090
See [installing dump1090](https://github.com/antirez/dump1090?tab=readme-ov-file#installation) and then run:

`nohup ./dump1090 --net > >/dev/null 2>&1 &`

### 3. Start docker project
`docker compose up -d`

### 4. View the map
Go to http://localhost:3000/map.html

## My setup
This application can run on a Raspberry Pi 2 Model B from 2015 with a A 900MHz quad-core ARM Cortex-A7 CPU and 1GB RAM and a 12GB memory card without any problems.