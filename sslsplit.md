#sslsplit

Based on https://blog.heckel.xyz/2013/08/04/use-sslsplit-to-transparently-sniff-tls-ssl-connections/

### Installing sslsplit
Debian now has packages for sslsplit, so just do
```
sudo apt-get sslsplit
```

### Generate the certificate
```
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 1826 -key ca.key -out ca.cer
```
Save the certificate on to your device.

### Setup iptables
If one has been following the mitmproxy installation instructions, ip forwarding will have been setup (and is persistant). Otherwise run
```
sysctl -w net.ipv4.ip_forward=1
```

Then setup iptables such that sslsplit will listen on port 8080 for TCP+non-SSL connections and port 8443 for TCP+SSL connections (the second and third lines are required for the raspi to work as an access point)
```
sudo iptables -F
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo iptables -A FORWARD -i eth0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8080
sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 8443
sudo iptables -t nat -A PREROUTING -p tcp --dport 587 -j REDIRECT --to-ports 8443
sudo iptables -t nat -A PREROUTING -p tcp --dport 465 -j REDIRECT --to-ports 8443
sudo iptables -t nat -A PREROUTING -p tcp --dport 993 -j REDIRECT --to-ports 8443
sudo iptables -t nat -A PREROUTING -p tcp --dport 5222 -j REDIRECT --to-ports 8080
```

### Running sslsplit
```
sudo sslsplit -D -l connections.log -j ./<directory where connection details go>/ -S ./<directory where logs go>/ -k ca.key -c ca.cer ssl 0.0.0.0 8443 tcp 0.0.0.0 8080
```

e.g.
```
sudo sslsplit -D -l connections.log -j ./sslconn/ -S ./ssllog/ -k ca.key -c ca.cer ssl 0.0.0.0 8443 tcp 0.0.0.0 8080
```