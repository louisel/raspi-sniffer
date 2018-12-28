# Reading a Raspbian SD card from a VM
After flashing Raspbian onto the sd card, it will have a ext4 partition that is not readable from Windows to OSX.

At one point we needed to change `/etc/network/interfaces` due to a problem with `ssh`-ing in (we are running in headless mode)

Since we couldn't find a good way to write to ext4 partitions on Windows or OSX, we read the sd card from a Linux VM.

Add the sdcard to the VM (on Windows for VirtualBox, Mac instructions for VirtualBox probably similar)
http://rizwanansari.net/access-sd-card-on-linux-from-windows-using-virtualbox/

The sdcard on the VM was a standard block device.
First check which drive it got loaded to:
```
ls /dev/
```
The raspbian sd card has 2 partitions, so it should look like sdx sdx1 sdx2, where sdx1 is the boot partition and sdx2 is where everything else lives. On this vm it's `sdb2` so we mount it using
```
sudo mount -t ext4 /dev/sdb2 /folder/to/mount/to
```
(make sure that `/folder/to/mount/to` exists or mount will throw an error)

Then one can access everything that is normally found in `/` under `/folder/to/mount/to`.
