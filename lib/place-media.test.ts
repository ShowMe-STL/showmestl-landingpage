import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  coverMediaId,
  extMatchesSniff,
  galleryObjectPath,
  isGalleryObjectPath,
  mediaSlug,
  pathFromPublicObjectUrl,
  posterObjectPath,
  publicObjectUrl,
  sniffMedia,
  thumbPathFor,
} from './place-media.ts'

const ARCH = [
  'places/556/gallery/arch-leg-9083b4e87b76d469.jpg',
  'places/556/gallery/arch-nps-3972752ab7af11bd.jpg',
  'places/556/gallery/arch-slideshow-2c6f72910dcccbad.mp4',
  'places/556/gallery/arch-slideshow-poster-464165776b03056a.jpg',
]

test('gallery paths match the place_media check constraint', () => {
  for (const path of ARCH) {
    assert.equal(isGalleryObjectPath(556, path), true)
  }
  assert.equal(isGalleryObjectPath(556, 'places/556/full.jpg'), false)
  assert.equal(isGalleryObjectPath(556, 'places/556/thumb.jpg'), false)
  assert.equal(isGalleryObjectPath(557, ARCH[0]!), false)
  assert.equal(
    isGalleryObjectPath(556, 'places/556/gallery/../full.jpg'),
    false,
  )
  assert.equal(isGalleryObjectPath(556, 'places/556/gallery/.hidden.jpg'), false)
})

test('generated names match the live sample shape', () => {
  const image = galleryObjectPath(556, 'arch-leg', '9083b4e87b76d469', 'jpg')
  const video = galleryObjectPath(
    556,
    'arch-slideshow',
    '2c6f72910dcccbad',
    'mp4',
  )
  const poster = posterObjectPath(556, 'arch-slideshow', '464165776b03056a')
  assert.equal(image, ARCH[0])
  assert.equal(video, ARCH[2])
  assert.equal(poster, ARCH[3])
  assert.equal(
    thumbPathFor(image),
    'places/556/gallery/arch-leg-9083b4e87b76d469-thumb.jpg',
  )
  assert.equal(isGalleryObjectPath(556, thumbPathFor(image)), true)
})

test('slugs stay inside the filename pattern', () => {
  assert.equal(mediaSlug('Arch Leg.JPG'), 'arch-leg')
  assert.equal(mediaSlug('Café Photo.png'), 'cafe-photo')
  assert.equal(mediaSlug('!!!'), 'media')
  assert.equal(mediaSlug(`${'a'.repeat(80)}.jpg`).length <= 40, true)
  const path = galleryObjectPath(12, mediaSlug('!!!'), 'abcdef0123456789', 'jpg')
  assert.equal(isGalleryObjectPath(12, path), true)
})

test('public URLs round-trip the object path', () => {
  const base = 'https://byhrutoctfobypmmphwl.supabase.co'
  const path = ARCH[0]!
  const url = publicObjectUrl(base, path)
  assert.equal(
    url,
    `${base}/storage/v1/object/public/place-media/${path}`,
  )
  assert.equal(pathFromPublicObjectUrl(url), path)
  assert.equal(pathFromPublicObjectUrl('https://example.com/full.jpg'), null)
  assert.equal(
    pathFromPublicObjectUrl(
      `${base}/storage/v1/object/public/place-media/places/556/full.jpg`,
    ),
    'places/556/full.jpg',
  )
})

test('the first image is the cover, even when a video is first', () => {
  assert.equal(
    coverMediaId([
      { id: 3, kind: 'video', position: 0 },
      { id: 2, kind: 'image', position: 2 },
      { id: 1, kind: 'image', position: 1 },
    ]),
    1,
  )
  assert.equal(coverMediaId([{ id: 3, kind: 'video', position: 0 }]), null)
})

test('sniffs the types the app stores', () => {
  const jpeg = sniffMedia(Uint8Array.from([0xff, 0xd8, 0xff, 0xdb]))
  assert.equal(jpeg.ok && jpeg.ext, 'jpg')

  const gif = sniffMedia(Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))
  assert.equal(gif.ok && gif.ext, 'gif')

  const mp4 = sniffMedia(
    Uint8Array.from([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d,
    ]),
  )
  assert.equal(mp4.ok && mp4.ext, 'mp4')
  assert.equal(extMatchesSniff('mp4', mp4), true)

  const mov = sniffMedia(
    Uint8Array.from([
      0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20,
    ]),
  )
  assert.equal(mov.ok && mov.ext, 'mov')

  const heic = sniffMedia(
    Uint8Array.from([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63,
    ]),
  )
  assert.equal(heic.ok, false)

  assert.equal(sniffMedia(Uint8Array.from([0x00, 0x01, 0x02])).ok, false)
})
