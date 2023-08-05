#!/usr/bin/env bash
sudo certbot -n -d $(/opt/elasticbeanstalk/bin/get-config environment -k DOMAIN) --nginx --agree-tos --email sumitahuja71@gmail.com
