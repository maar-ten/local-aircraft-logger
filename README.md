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

`nohup ./dump1090 --net > /dev/null 2>&1 &`

### 3. Start docker project
`docker compose up -d`

### 4. View the map
Go to http://localhost:3000/map.html

## My setup
This application can run on a Raspberry Pi 2 Model B from 2015 with a A 900MHz quad-core ARM Cortex-A7 CPU and 1GB RAM and a 12GB memory card without any problems.

## My take aways
Decoding of the Automatic Dependent Surveillance-Broadcast messages of aircrafts is weird, but facinating and super efficient.

Take the location for instance. They could just send their geo-coordinates (lat,lon), but that would take up all of the 112 bit message.
Instead they sent grid locations of two separate grids (in 2 messages) where the plotted points only line up at one specific point if you would lay both grids on top of each other.
Because the grids they use are fixed and part of the specification, you only need 68 bits to encode it.
It's called [compact position system](https://mode-s.org/1090mhz/content/ads-b/3-airborne-position.html#an-over-simplified-example).

Another is the altitude encoding. They can encode it in 25ft or 100ft increments or just put meters in that field. Which unit it is, is encoded in the same field using 2 special bits ([altitude decoding](https://mode-s.org/1090mhz/content/ads-b/3-airborne-position.html#altitude-decoding)).

If you want to know more you should take a look at [The 1090 Megahertz Riddle](https://mode-s.org/1090mhz/).