import numpy as np, wave
SR=44100; D=56.5; N=int(SR*D); rng=np.random.default_rng(3)
def T(n): return np.arange(n)/SR
def lp(x,a):  # one-pole lowpass, a in (0,1)
    y=np.empty_like(x); s=0.
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def put(buf,t,sig,g=1.):
    i=int(t*SR)
    if i<0: sig=sig[-i:]; i=0
    j=min(len(buf),i+len(sig)); buf[i:j]+=sig[:j-i]*g
def env(n,a,r): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/r)
# ---------- music ----------
m=np.zeros(N); 
def note(f): return 440*2**((f-69)/12)
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
bar=60/96*4
# pads (filtered detuned saw approximated by additive)
for ci in range(int(D/(2*bar))+1):
    ch=chords[ci%4]; t0=ci*2*bar; n=int(2*bar*SR)+SR
    t=T(n); sig=np.zeros(n)
    for f in ch+[ch[0]-12]:
        for det in (-0.12,0.12):
            fr=note(f+det)
            for h in range(1,6): sig+=np.sin(2*np.pi*fr*h*t)/h**1.6
    e=np.minimum(1,t/1.2)*np.minimum(1,np.maximum(0,(2*bar+1-t))/1.0)
    put(m,t0,sig*e,0.018)
# pluck arpeggio from 5s, 8ths
step=60/96/2
k=0
for i in range(int(D/step)):
    t0=i*step
    if t0<5.0 or (47.2<t0<49.76) or t0>55.5: continue
    ch=chords[int(t0/(2*bar))%4]; f=note(ch[[0,1,2,1][i%4]]+12+(12 if i%8==7 else 0))
    n=int(.6*SR); t=T(n); sig=(np.sin(2*np.pi*f*t)+.3*np.sin(4*np.pi*f*t))*np.exp(-t/.18)
    put(m,t0,sig,0.05)
# kick + soft hat on beats from 9s
beat=60/96
for i in range(int(D/beat)):
    t0=i*beat
    if t0<8.9 or (47.2<t0<49.76) or t0>55.0: continue
    n=int(.35*SR); t=T(n); f=50+90*np.exp(-t/.03); ph=2*np.pi*np.cumsum(f)/SR
    put(m,t0,np.sin(ph)*np.exp(-t/.12),0.22)
    hn=int(.05*SR); put(m,t0+beat/2,rng.standard_normal(hn)*np.exp(-T(hn)/.01),0.015)
# bass
for i in range(int(D/beat)):
    t0=i*beat
    if t0<8.9 or (47.2<t0<49.76) or t0>55.0: continue
    f=note(chords[int(t0/(2*bar))%4][0]-24); n=int(beat*SR); t=T(n)
    put(m,t0,np.sin(2*np.pi*f*t)*env(n,.01,.35),0.12)
# final chord swell at end
n=int(4.5*SR);t=T(n);sig=sum(np.sin(2*np.pi*note(f)*t) for f in [57,60,64,69,45])*np.minimum(1,t/.3)*np.exp(-t/2.2)
put(m,52.0,sig,0.03)
# ---------- sfx ----------
s=np.zeros(N)
def whoosh(t0,dur=.7,g=.35):
    n=int(dur*SR); x=rng.standard_normal(n); tt=T(n)
    a=0.02+0.25*np.sin(np.pi*tt/dur)**2; y=np.empty(n); v=0.
    for i in range(n): v+=a[i]*(x[i]-v); y[i]=v
    put(s,t0-dur*.5,y*np.sin(np.pi*tt/dur)**2,g)
def hit(t0,g=.5):
    n=int(.5*SR); t=T(n); f=45+120*np.exp(-t/.04); ph=2*np.pi*np.cumsum(f)/SR
    put(s,t0,np.sin(ph)*np.exp(-t/.18)+.25*rng.standard_normal(n)*np.exp(-t/.02),g)
def ding(t0,f=1320,g=.12):
    n=int(1.2*SR); t=T(n); put(s,t0,(np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/.1))*np.exp(-t/.35),g)
def pop(t0,g=.18):
    n=int(.12*SR); t=T(n); f=900-600*t/.12; put(s,t0,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.03),g)
for t0 in [5.0,8.9,17.9,30.3,37.85,42.45,47.15,52.2]: whoosh(t0)
whoosh(22.9,1.1,.5)
for t0 in [0.0,1.6,2.92,4.12]: hit(t0,.35); whoosh(t0+.05,.35,.25)
for t0 in [7.64,25.76,29.46,36.6,48.66]: hit(t0,.45)
for i,t0 in enumerate([14.46,15.22,16.04,16.56]): ding(t0,1320*2**(i*2/12))
for i,t0 in enumerate([39.3,39.9,40.6,41.4]): ding(t0,1046*2**(i*3/12),.1)
for t0 in [9.2,10.75,19.1,21.5,22.4,42.5,42.66,44.26,36.7,36.85,37.0,33.0,35.1,52.4,53.15]: pop(t0)
# riser
n=int(1.6*SR);t=T(n);f=200*2**(t*2.2);riser=(np.sin(2*np.pi*np.cumsum(f)/SR)*.4+lp(rng.standard_normal(n),.15))*(t/1.6)**2
put(s,49.76-1.6,riser,.3)
# boom
n=int(2.5*SR);t=T(n);f=38+60*np.exp(-t/.08);put(s,49.76,np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.7),.9)
# coins
for i in range(22): ding(49.85+rng.random()*1.6,2400+rng.random()*1800,.05)
# tap
pop(54.7,.3); ding(54.72,1760,.08)
def wr(fn,x):
    x=np.clip(x,-1,1); w=wave.open(fn,'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype(np.int16).tobytes()); w.close()
wr('music.wav',m/np.max(np.abs(m))*.8); wr('sfx.wav',s/np.max(np.abs(s))*.9)
