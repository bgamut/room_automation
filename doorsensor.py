#serial is pyserial
import serial
import re
from time import sleep
from gmail import GMail, Message
from subprocess import call
import datetime
import pytz
import _thread as thread
import os
import json
def tokyo_time():
    if (int(datetime.datetime.now(tz=pytz.timezone('Asia/Tokyo')).strftime("%H"))<=12):
        timenow=datetime.datetime.now(tz=pytz.timezone('Asia/Tokyo')).strftime("%Y_%m_%d_%H_%M_%S")+"_AM"
    else:
        timenow=datetime.datetime.now(tz=pytz.timezone('Asia/Tokyo')).strftime("%Y_%m_%d_")+str(int(datetime.datetime.now(tz=pytz.timezone('Asia/Tokyo')).strftime("%H"))-12)+datetime.datetime.now(tz=pytz.timezone('Asia/Tokyo')).strftime("_%M_%S")+"_PM"
    return timenow
def tokyo_date():
    today=datetime.datetime.now(tz=pytz.timezone('Asia/Tokyo')).strftime("%Y_%m_%d")
    return today
def WIFI_connection_maintainer():
    call(['node','WIFIConnect.js'])
def relativepath(filename, subdirectory=''):
    dirname=os.getcwd()
    if subdirectory is not '':
        dirname=os.path.join(dirname,subdirectory)
    filepath = os.path.join(dirname, filename)
    return filepath
def jd(filename):
    filepath = relativepath(filename, 'json')
    if os.access(filepath,os.W_OK):
        with open(filepath,'r') as f:
            data = json.load(f)
        f.close()
    else:
        data = {}
    return data
thread.start_new_thread(WIFI_connection_maintainer,())
ser = serial.Serial('/dev/cu.usbmodemFA1371',9600)
#ser = serial.Serial('COM3',9600)
buffer=[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0]
buffer2=[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0]
firstEmail=False
just_booted_up=True
"""
sender=jd('localInfo.json')['smtpgmailsender']
password=jd('localInfo.json')['smtpgmailpassword']
testreceiver = jd('localInfo.json')['smtpgmailpassword']
"""
print("Watchdog watching the door from "+tokyo_time())

countdown=50
for i in range(countdown+1):
    print("door sensor detection mode in "+str(countdown-i))
    sleep(1)

closed=True
prevnumber=1.0
newAverage=1.0
buffer2=[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0]
while(True):
    #print(ser.read())
    if (ser.read()=='1'):
        number=1.0
    else:
        number=0.0
    average=0
    buffer.insert(0,number)
    buffer.pop()
    #print(buffer)
    for i in range(8):
        average+=buffer[i]/8
    
    if(average==1.0):
        number=1.0
        
    else:
        number=0.0

    
    if (prevnumber!=number):
        prevnumber=number

    
        if (number==1.0):
            print("door closed at "+tokyo_time())
            firstEmail=True
        elif (number==0.0):
            print("door opened at "+tokyo_time())
            """
            #call(["node","securitySnap.js"])
            print('email sent')
            """
    

        
    

    
    

