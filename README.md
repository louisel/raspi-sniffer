# raspi-sniffer
Sniff traffic on a raspberry pi acting as an access point

This is still a work in progress. We are updating as we go along.

# Requirements
Raspberry Pi
Wifi dongle (if using Raspberry Pi without wifi)

# Our setup
Raspberry Pi model B rev 2 with a TP-Link TL-WN772N wifi dongle in headles mode

### Initial SSH setup
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

### Setup DHCP server

To install the DHCP server, run the command:
```sudo apt-get install isc-dhcp-server```

Configure the **/etc/dhcp/dhcpd.conf** by commenting out the following 2 lines:
```
option domain-name "example.org";
option domain-name-servers ns1.example.org, ns2.example.org;
```
Uncomment the word authoritative in the section:
```
# If this DHCP server is the official DHCP server for the local
# network, the authoritative directive should be uncommented.
#authoritative;
```
Lastly, add the following lines to the end of the configuration file:
```
subnet 192.168.10.0 netmask 255.255.255.0 {
 range 192.168.10.10 192.168.10.20;
 option broadcast-address 192.168.10.255;
 option routers 192.168.10.1;
 default-lease-time 600;
 max-lease-time 7200;
 option domain-name "local-network";
 option domain-name-servers 8.8.8.8, 8.8.4.4;
}
```

Configure the file **/etc/default/isc-dhcp-server** by updating the line  
```INTERFACESv4=”wlan0”```
This ensures that wlan0 is the interface on which the DHCP server leases IP addresses. 

The DHCP server needs to be configured with a static IP address. To begin, ensure that the wlan0 interface is down by running the command: 
```sudo ifdown wlan0```

Update the file **/etc/network/interfaces** with the following lines: 
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

Note: If isc-dhcp-server fails to start, try removing the file dhcpd.pid
```
sudo rm /var/run/dhcpd.pid
```

### Setup hostapd
Run `sudo apt-get hostapd`

Edit **/etc/hostapd/hostapd.conf**:
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

Edit the following line in **/etc/defaults/hostapd**:
```DAEMON_CONF=/etc/hostapd/hostapd.conf```

Add/edit the following line in **/etc/init.d/hostapd**:
```DAEMON_CONF=/etc/hostapd/hostapd.conf```

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
```

To run mitmproxy, run:
```
mitmproxy --mode transparent --showhost
```

To run mitmdump (the command line interface counterpart), run:
```
mitmdump --mode transparent --showhost -w <file to output here>
```

### (Optional) tshark integration 

mitmproxy/mitmdump does not have native support for .pcap files (which can be visualised in wireshark), so we follow these steps to get packet capture (tshark) working with mitmproxy: (taken from https://docs.mitmproxy.org/stable/howto-wireshark-tls/)

```
sudo apt-get install tshark
echo "export SSLKEYLOGFILE=\"$PWD/.mitmproxy/sslkeylogfile.txt\"" >> ~/.bashrc
source ~/.bashrc
```

Run tshark in the background before running mitmproxy:
```
nohup sudo tshark -w <filename> -i wlan0
```
where <filename> is the name of the output file of the packet capture.

To use tshark for traffic analysis, run the command:
```
sudo tshark -r <filename> -Y "<display filter>"
```
where <filename> is the name of the .pcap file to read and <display filter> is the filter to be applied. 

## Possibly interesting display filters to use
To filter for http headers:
```
http contains <string>
http2.header.value contains <string>
```
where <string> is the string that the header should contain in both cases.

### Note: 
If ssh fails after reboot, remove wifi dongle and reboot again. 
