from PIL import Image; import glob,sys
fs=sorted(glob.glob('snaps/*.jpg'),key=lambda f:float(f[7:-4]))
W,H=270,480;cols=10
sh=Image.new('RGB',(W*cols,H*((len(fs)+cols-1)//cols)))
for i,f in enumerate(fs): sh.paste(Image.open(f).resize((W,H)),((i%cols)*W,(i//cols)*H))
sh.save(sys.argv[1],quality=85)
