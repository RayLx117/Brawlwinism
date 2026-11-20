import sys
from PIL import Image
out, cols, sc = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]); fs = sys.argv[4:]
ims=[Image.open(f) for f in fs]; w,h=ims[0].size; rows=(len(ims)+cols-1)//cols
c=Image.new('RGB',(w*cols,h*rows),'white')
for i,im in enumerate(ims): c.paste(im,((i%cols)*w,(i//cols)*h))
c=c.resize((int(c.width*sc),int(c.height*sc))); c.save(out); print(c.size)
