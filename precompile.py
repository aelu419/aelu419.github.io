import glob, os

'''
the following script processes images and videos
to fit blocks of content on the website
'''
root = os.getcwd()

def clear(dir):
    prev_dir = os.getcwd()
    os.chdir(dir)
    for f in glob.glob('*'):
        os.remove(f)
    os.chdir(prev_dir)

# un-processed files
res_img_major = os.path.join(root, 'res', 'img', 'major') # major projects
res_img_minor = os.path.join(root, 'res', 'img', 'minor') # minor projects
res_img_illust = os.path.join(root, 'res', 'img', 'illust') # illustrations
res_deco = os.path.join(root, 'res', 'img', 'deco') # site decorations

# destination for processed files
thumbnail = os.path.join(root, 'preview', 'thumbnail')

# small blocks for minor projects and experiments
block_height_small = 160
# large blocks for major projects
block_height_large = 320

# 1. preprocess images
from PIL import Image
# batch resize all image files in the source directory
# and save them in the destination directory as thumbnails
def compress_img(src, dest, max_height):
    prev_dir = os.getcwd()
    os.chdir(src)
    imgs = glob.glob('*')
    
    tosave = []
    for img in imgs:
        print('processing image: ', img)
        file, ext = os.path.splitext(img)
        with Image.open(img) as im:
            im = im.convert('RGB')
            # resize by height
            w, h = im.size
            w = int(max_height / h * w) 
            im.thumbnail((w, h))
            tosave.append((im, file + '.jpeg'))
    
    os.chdir(dest)
    for t in tosave:
        t[0].save(t[1], 'JPEG')
    
    os.chdir(prev_dir)

# clear out preexisting thumbnails
clear(thumbnail)
compress_img(res_img_major, thumbnail, block_height_large)
compress_img(res_img_minor, thumbnail, block_height_small)

# 2. precompress videos
res_vid_major = os.path.join(root, 'res', 'vid', 'major') # major projects
res_vid_minor = os.path.join(root, 'res', 'vid', 'minor') # minor projects

video = os.path.join(root, 'preview', 'video')

import ffmpeg
# batch resize all image files in the source directory
# and save them in the destination directory as thumbnails
def compress_video(src, dest, max_height):
    prev_dir = os.getcwd()
    os.chdir(src)
    vids = glob.glob('*')
    for vid in vids:
        print('processing video: ' + vid)
        file, ext = os.path.splitext(vid)
        input = ffmpeg.input(vid)
        input = input.video
        input = input.filter('fps', 12)
        input = input.filter('scale', -1, max_height)
        input.output(os.path.join(dest, file + '.webm')).run()
    os.chdir(prev_dir)

clear(video)
compress_video(res_vid_major, video, block_height_large)
compress_video(res_vid_minor, video, block_height_small)
