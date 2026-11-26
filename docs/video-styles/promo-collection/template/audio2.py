import numpy as np, wave
SR=44100; D=39.5; N=int(SR*D); rng=np.random.default_rng(5)
def T(n): return np.arange(n)/SR
def put(buf,t,sig,g=1.):
    i=int(t*SR)
    if i<0: sig=sig[-i:]; i=0
    j=min(len(buf),i+len(sig)); buf[i:j]+=sig[:j-i]*g
def nf(m): return 440*2**((m-69)/12)
m=np.zeros(N)
# progression Dm - Bb - F - C (warm, Mediterranean), 84 bpm, 1 bar each
bpm=84; beat=60/bpm; bar=4*beat
chords=[[50,53,57],[46,50,53],[53,57,60],[48,52,55]]
def sect_gain(t):  # dynamics: intro soft, routes swell, tavern lift, end resolve
    if t<3.8: return .6
    if t<12.6: return .75
    if t<18.3: return 1.15
    if t<25.8: return .9
    return .85
nb=int(D/bar)+1
for ci in range(nb):
    t0=ci*bar; ch=chords[ci%4]; n=int((bar+1.5)*SR); t=T(n); sig=np.zeros(n)
    for f in ch+[ch[0]-12,ch[2]+12]:
        for det in (-.1,.1):
            fr=nf(f+det)
            for h in range(1,5): sig+=np.sin(2*np.pi*fr*h*t+h)/h**1.8
    e=np.minimum(1,t/.9)*np.minimum(1,np.maximum(0,bar+1.5-t)/1.2)
    put(m,t0,sig*e,.014*sect_gain(t0))
# soft piano/harp arpeggio 8ths
step=beat/2
for i in range(int(D/step)):
    t0=i*step
    if t0>38.2: break
    ch=chords[int(t0/bar)%4]; f=nf(ch[[0,1,2,1,2,0,1,2][i%8]]+12+(12 if i%8==5 else 0))
    n=int(1.2*SR); t=T(n); sig=(np.sin(2*np.pi*f*t)+.25*np.sin(4*np.pi*f*t)+.08*np.sin(6*np.pi*f*t))*np.exp(-t/.45)
    put(m,t0,sig,.04*sect_gain(t0))
# bass + soft brushed beat from 3.8
for i in range(int(D/beat)):
    t0=i*beat
    if t0<3.8 or t0>37.8: continue
    f=nf(chords[int(t0/bar)%4][0]-12); n=int(beat*SR); t=T(n)
    put(m,t0,np.sin(2*np.pi*f*t)*np.minimum(1,t/.01)*np.exp(-t/.5),.10*sect_gain(t0))
    if i%2==0:
        k=int(.3*SR); tk=T(k); fk=48+70*np.exp(-tk/.03); put(m,t0,np.sin(2*np.pi*np.cumsum(fk)/SR)*np.exp(-tk/.15),.12*sect_gain(t0))
    hn=int(.08*SR); put(m,t0+beat/2,rng.standard_normal(hn)*np.exp(-T(hn)/.02),.006*sect_gain(t0))
# bouzouki-like tremolo melody in tavern section 22.3-25.8
mel=[62,65,64,62,60,62,57,58,57,55,57]
for k,nn in enumerate(mel):
    t0=22.3+k*0.32; f=nf(nn+12); n=int(.34*SR); t=T(n)
    trem=(0.6+0.4*np.sign(np.sin(2*np.pi*14*t)))
    sig=(np.sin(2*np.pi*f*t)+.5*np.sin(4*np.pi*f*t)+.3*np.sin(6*np.pi*f*t)+.2*np.sin(8*np.pi*f*t))*trem*np.exp(-t/.25)
    put(m,t0,sig,.05)
# final chord
n=int(4*SR);t=T(n);put(m,35.4,sum(np.sin(2*np.pi*nf(f)*t) for f in [50,57,62,65,69])*np.minimum(1,t/.4)*np.exp(-t/1.6),.035)
# ---------- sfx ----------
s=np.zeros(N)
def lpn(n,a):
    x=rng.standard_normal(n); y=np.empty(n); v=0.
    for i in range(n): v+=a[i]*(x[i]-v); y[i]=v
    return y
def whoosh(t0,dur=.8,g=.22):
    n=int(dur*SR); tt=T(n); a=.01+.12*np.sin(np.pi*tt/dur)**2; put(s,t0-dur*.5,lpn(n,a)*np.sin(np.pi*tt/dur)**2,g)
def shimmer(t0,g=.06):
    for k in range(10):
        f=1800+k*260+rng.random()*80; n=int(1.6*SR); t=T(n); put(s,t0+k*.05,np.sin(2*np.pi*f*t)*np.exp(-t/.5),g)
def ding(t0,f=1568,g=.08):
    n=int(1.0*SR); t=T(n); put(s,t0,(np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*2.4*f*t)*np.exp(-t/.08))*np.exp(-t/.4),g)
def soft(t0,g=.12):
    n=int(.25*SR); t=T(n); f=500-250*t/.25; put(s,t0,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.06),g)
for t0 in [3.8,6.5,12.6,18.3,22.3,25.8,28.6,30.4,31.6]: whoosh(t0)
shimmer(0.3); shimmer(31.7)
for t0 in [13.7,14.45,15.2]: soft(t0)
for i,t0 in enumerate([26.82,28.06,28.78]): ding(t0,1397*2**(i*4/12))
for t0 in [7.6,8.3]: soft(t0,.08)
def wr(fn,x):
    x=np.clip(x,-1,1); w=wave.open(fn,'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype(np.int16).tobytes()); w.close()
wr('music2.wav',m/np.max(np.abs(m))*.8); wr('sfx2.wav',s/np.max(np.abs(s))*.9)
