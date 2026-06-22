#!/bin/bash

echo "Stopping Prelegal..."

if docker ps -q -f name=prelegal | grep -q . ; then
    docker stop prelegal
    docker rm prelegal
    echo "Prelegal stopped"
else
    echo "Prelegal is not running"
fi
