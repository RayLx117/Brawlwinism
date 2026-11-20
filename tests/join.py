import sys
from PIL import Image
out=sys.argv[1]; fs=sys.argv[2:]
ims=[Image.open(f) for f in fs]
w,h=ims[0].size; c=Image.new('RGB',(w*len(ims),h))
for i,im in enumerate(ims): c.paste(im,(i*w,0))
c=c.resize((int(c.width*float(__import__('os').environ.get('SC','0.5'))),int(c.height*float(__import__('os').environ.get('SC','0.5'))))); c.save(out)
