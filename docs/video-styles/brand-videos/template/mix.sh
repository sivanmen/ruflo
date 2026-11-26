#!/usr/bin/env bash
# usage: ./mix.sh vo.mp3 music.mp3 CUT P2 DUR   (CUT = end of part-1 sentence in vo; P2 = start time of part 2 in output)
# reference: ./mix.sh vo.mp3 music_el.mp3 11.40 18.92 40.5
VO=$1; MU=$2; CUT=$3; P2=$(python3 -c "print(int($4*1000))"); D=$5; FO=$(python3 -c "print($5-2.2)")
ffmpeg -v error -y -i $VO -i $VO -i $MU -filter_complex "[0:a]atrim=0:$CUT,asetpts=PTS-STARTPTS,adelay=2000|2000[a1];[1:a]atrim=$CUT,asetpts=PTS-STARTPTS,adelay=$P2|$P2[a2];[a1][a2]amix=inputs=2:normalize=0,aresample=44100,pan=mono|c0=c0,apad=whole_dur=$D,highpass=f=80,acompressor=threshold=-18dB:ratio=2.5,volume=1.5[v];[v]asplit[v1][v2];[2:a]aresample=44100,pan=mono|c0=0.5*c0+0.5*c1,volume=0.55,afade=t=out:st=$FO:d=2.2[m];[m][v2]sidechaincompress=threshold=0.04:ratio=4:attack=60:release=600[md];[v1][md]amix=inputs=2:normalize=0,alimiter=limit=0.95,aformat=channel_layouts=stereo" -t $D mix.wav
echo "mix.wav built. Final: ffmpeg -i video.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5:LRA=11 -shortest -movflags +faststart FINAL.mp4"
