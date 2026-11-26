#!/usr/bin/env bash
# BRAND-01 background builder. Edit the SHOTS list (file|out|type|start|dur|x|z0|z1) and CUTS, then run from build/.
# type: v = vertical/landscape video, s = landscape still (pan/push), p = portrait still (push)
set -e
GR="eq=contrast=1.04:saturation=1.05:gamma=0.98,colorbalance=rs=0.02:gs=0.0:bs=-0.03:rh=0.02:bh=-0.02"
mkdir -p seg
vseg(){ ffmpeg -v error -y -ss $3 -i $1 -t $4 -vf "$5scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,$GR,format=yuv420p" -an -c:v libx264 -preset fast -crf 16 seg/$2.mp4; }
lstill(){ ffmpeg -v error -y -loop 1 -framerate 30 -t $3 -i $1 -vf "scale=-2:2400,crop=1350:2400:(iw-1350)*$4:0,scale=w='trunc(1080*($5+($6-$5)*t/$3)/2)*2':h=-2:eval=frame,crop=1080:1920,$GR,format=yuv420p" -c:v libx264 -preset fast -crf 16 seg/$2.mp4; }
pstill(){ ffmpeg -v error -y -loop 1 -framerate 30 -t $3 -i $1 -vf "scale=1080:-2,scale=w='trunc(1080*($4+($5-$4)*t/$3)/2)*2':h=-2:eval=frame,crop=1080:1920,$GR,format=yuv420p" -c:v libx264 -preset fast -crf 16 seg/$2.mp4; }
# phone-scene background: blurred, darkened interior
phonebg(){ ffmpeg -v error -y -loop 1 -framerate 30 -t $3 -i $1 -vf "scale=-2:2112,crop=1188:2112:(iw-1188)*0.55:0,crop=1080:1920:x='54-54*t/$3':y='96-50*t/$3',boxblur=8:1,eq=brightness=-0.16:saturation=0.85,format=yuv420p" -c:v libx264 -preset fast -crf 16 seg/$2.mp4; }

# ---- Reference (SIVAN COLLECTION v2) ----
vseg a/v_chania.mp4 s01 0 5.0 ""                      # Chania 4K aerial (pre-cropped)
vseg a/v_ks1.mp4    s02 0.3 3.5 ""                    # KS u7 animated render
phonebg a/int_living.jpg s03 6.9                      # phone scene bg
vseg mat/u8.mp4     s04 0 6.5 "crop=ih*9/16:ih:iw*0.30:0,"   # KS pool dolly
lstill a/int_living.jpg s05a 2.6 0.62 1.02 1.10       # KS living room
lstill mat/s43_18.jpg   s05b 2.6 0.45 1.10 1.02       # KS terrace + sea
pstill a/gen_tavern.png s06 4.3 1.02 1.09             # tavern (AI)
lstill mat/s49_24.jpg   s07 3.2 0.40 1.00 1.08        # KS pools
lstill a/int_kitchen.jpg s08 2.2 0.30 1.08 1.00       # KS kitchen
vseg a/v_harbor.mp4 s09 1.0 2.0 ""                    # Chania lighthouse dusk
lstill mat/s49_1.jpg    s10 8.9 0.62 1.00 1.08        # KING SOLOMON sign (end)

FILES=(s01 s02 s03 s04 s05a s05b s06 s07 s08 s09 s10)
CUTS=(4.6 7.3 13.4 19.1 21.1 23.1 26.6 29.0 30.6 32.0)   # scene cut times (seconds)
DUR=40.5; X=0.6
args=""; for f in ${FILES[@]}; do args="$args -i seg/$f.mp4"; done
fc=""; prev="[0:v]"; n=${#CUTS[@]}
for i in $(seq 1 $n); do off=$(python3 -c "print(round(${CUTS[$((i-1))]}-$X/2,3))"); fc="$fc$prev[$i:v]xfade=transition=fade:duration=$X:offset=$off[v$i];"; prev="[v$i]"; done
ffmpeg -v error -y $args -filter_complex "${fc}${prev}noise=alls=5:allf=t,vignette=PI/5[vo]" -map "[vo]" -t $DUR -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p bg.mp4
echo "bg.mp4 built"
