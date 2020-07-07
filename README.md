server_app.js allows you to log output from all of your servers to a single central server.

To install server_app.js on your central server using systemd run:

1. (From the audiocc directory) cp server_app.js.service /lib/systemd/system/
2. systemctl daemon-reload
3. (To run the server_app.js program at boot time) systemctl enable server_app.js
4. systemctl start server_app.js
5. (To see the status of service) systemctl status server_app.js (or for historic logs of the service) journalctl -r -u server_app.js
