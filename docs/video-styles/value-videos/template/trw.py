import sys, wave, json, numpy as np
from faster_whisper import WhisperModel
w=wave.open(sys.argv[1]); a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
m=WhisperModel("medium",compute_type="int8")
segs,_=m.transcribe(a,language="he",word_timestamps=True)
out=[]
for s in segs:
    print(f"{s.start:5.2f}-{s.end:5.2f} {s.text}")
    for wd in s.words: out.append([round(wd.start,2),round(wd.end,2),wd.word.strip()])
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False)
