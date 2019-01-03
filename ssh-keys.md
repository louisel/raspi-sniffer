# SSH using keys

Rather than typing in the password all the time, one can ssh in with keys.

Generate keys used for ssh (on Windows this can be done with putty's PUTTYGEN)

Point your local machine's ssh to use your private keys (on putty, this would be Connection > SSH > Auth on the left menu)

Copy the public key to the raspi's /home/<user>/.ssh/authorized_keys`file (it must be in a single line, and should start with`ssh-rsa`)

ssh is very picky about the permissions on your folders, so ensure that your home directory is only writable by the owner:

```
chmod go-w /home/<user>
```

and the `.ssh` and `authorized_keys` have the correct permissions:

```
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```
