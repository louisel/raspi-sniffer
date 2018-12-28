# raspi-sniffer
Sniff traffic on a raspberry pi acting as an access point

This is still a work in progress. We are updating as we go along.

# Requirements
Raspberry Pi
Wifi dongle (if using Raspberry Pi without wifi)

# Our setup
Raspberry Pi model B rev 2 with a TP-Link TL-WN772N wifi dongle in headles mode

### Initial setup
Flash the raspbian stretch lite image.
Since we are running in headless mode: put `ssh` file (no file extension) in the boot partition
If logging in with `ssh`,
```
passwd
```
To change the password
Then enable ssh on boot:
```
sudo update-rc.d ssh defaults
sudo update-rc.d ssh enable
```

### Setup access point
Follow the instructions from this website:
http://raspberrypihq.com/how-to-turn-a-raspberry-pi-into-a-wifi-router/

### Setup dhcp server
Some updates were made to the instructions from the above website:
`/etc/network/interfaces`: 
```
auto lo

iface lo inet loopback

auto eth0
iface eth0 inet dhcp

allow-hotplug wlan0

iface wlan0 inet static
 address 192.168.10.1
 netmask 255.255.255.0
 ```

Then enable classic networking
```
sudo systemctl disable dhcpcd
sudo systemctl enable networking
```
Credit: https://raspberrypi.stackexchange.com/questions/37920/how-do-i-set-up-networking-wifi-static-ip-address/74428#74428 

In the file `/etc/default/isc-dhcp-server`, set: `INTERFACESv4=”wlan0”`

If isc-dhcp-server fails to start, remove the file dhcpd.pid
```sudo rm /var/run/dhcpd.pid```

### Setup hostapd
Run `sudo apt-get hostapd`

Edit `/etc/hostapd/hostapd.conf`:
```
ssid=<YOUR SSID GOES HERE>
wpa_passphrase=<YOUR PASSPHRASE GOES HERE>
driver=nl80211 # If this does not work, check what driver your wifi dongle works with
interface=wlan0
country_code=US
hw_mode=g
channel=6
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_pairwise=CCMP
rsn_pairwise=CCMP
```
  
Edit the following line in `/etc/defaults/hostapd`:
`DAEMON_CONF=/etc/hostapd/hostapd.conf`

Add/edit the following line in `/etc/init.d/hostapd`:
`DAEMON_CONF=/etc/hostapd/hostapd.conf`

### Install tshark

sudo apt-get install tshark

### Install mitmproxy

Run the following lines:
```
sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -w net.ipv4.conf.all.send_redirects=0
sudo iptables -F
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo iptables -A FORWARD -i eth0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT
sudo iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 443 -j REDIRECT --to-port 8080
```

Add the following lines to `/etc/sysctl.d/mitmproxy.conf` to force the first two lines to persist
```
net.ipv4.ip_forward=1
net.ipv4.conf.all.send_redirects=0
```

To avoid having to re-configure the iptables each time the Pi reboots, save the iptables rules:
```
sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"
```

Create a bash script (`/etc/network/if-up.d/iptables`) with the following commands:
```
#!/bin/sh
iptables-restore < /etc/iptables.ipv4.nat
```
Ensure that the script is executable:
```
chmod +x /etc/network/if-up.d/iptables
```
The iptables rules will now be restored upon network (re)start. 

Setup mitmproxy in a pyenv because mitmproxy requires python>=3.6 but raspbian only has python 3.5.3
```
pyenv install 3.7.1
pyenv virtualenv 3.7.1 mitm
pyenv activate mitm
pip install mitmproxy
mitmproxy --mode transparent --showhost
```
### Note: 
If ssh fails after reboot, remove wifi dongle and reboot again. 
