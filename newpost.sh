#!/bin/bash

if [ $# == 0 ];
then
    name=$(( $(basename $(find content -type f -name '*.md' | awk -F/ '{print $5}' | sort -nr | head -n1) .md) + 1 ))
else
    name=$1
fi;

date=$(date +%Y-%m-%d)
path=content/post/$date-$name.md

echo "---
title: \"$name\"
categories: [\"unknown\"]
date: "$date"
---" >> $path

echo "$path created"
