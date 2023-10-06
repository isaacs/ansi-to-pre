#!/usr/bin/env bash
seq=$'\u2588\u2588\u2593\u2593\u2592\u2592\u2591\u2591'

r=(1 3 2 6 4 5)
rainbow () {
  f=$1
  b=$2
  t=$3
  echo -n $'\x1b['$t';30;100m'$seq
  for i in {0..6}; do
    fc=$([ $i -eq 0 ] && echo 90 || echo "$f${r[$[$i - 1]]}")
    bc=$([ $i -eq 6 ] && echo 100 || echo "$b${r[$i]}")
    echo -n $'\x1b['"${fc};${bc}m$seq"
  done
  echo -n $'\x1b[90;40m'$seq
  echo $'\x1b[40m  \x1b[0;22m'
}
rainbow 3 4 2
rainbow 3 4
rainbow 9 10
rainbow 9 10 2
