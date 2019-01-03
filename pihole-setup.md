```
curl -sSL https://install.pi-hole.net | bash
```

(or https://github.com/pi-hole/pi-hole/#one-step-automated-install for other instructions instead of piping to bash)

Answer OK to all defaults, except when asked to choose interface choose wlan0 (instead of eth0, the default)

If you want to test, change the following line in /etc/dnsmasq.d/01-pihole.conf:

```
interface=eth0
```

and you can setup your device's dns to be the raspi.
