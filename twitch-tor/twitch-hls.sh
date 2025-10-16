#!/usr/bin/env bash
# twitch-hls.sh  (Tor only)
export ALL_PROXY=socks5://tor:9050
CHANNEL=$1
QUALITY=$2
streamlink https://www.twitch.tv/${CHANNEL} ${QUALITY} --stdout
# → stdout HLS segments → pipe to Bless / IPFS / etc.
