import 'dotenv/config'
import Koa, { Context } from 'koa'
import Router from '@koa/router'
import kyc from '@/kycService'
import { bodyParser } from '@koa/bodyparser'
import { encodeImageToBase64, fetchImageToBase64 } from './processImage'

const app = new Koa()
const router = new Router()

app.use(bodyParser())

router.post('/kyc', async (ctx: Context) => {
  let image: string
  
  if (ctx.request.body.source === 'filesystem') {
    if (!ctx.request.body.path) {
      ctx.status = 400
      ctx.body = { error: '"path" is required when source is "filesystem"' }
      return
    }
    image = encodeImageToBase64(ctx.request.body.path)
  } else if (ctx.request.body.source === 'url') {
    if (!ctx.request.body.url) {
      ctx.status = 400
      ctx.body = { error: '"url" is required when source is "url"' }
      return
    }
    image = await fetchImageToBase64(ctx.request.body.url)
  } else if (ctx.request.body.source === 'base64') {
    if (!ctx.request.body.image) {
      ctx.status = 400
      ctx.body = { error: '"image" is required when source is "base64"' }
      return
    }
    image = ctx.request.body.image
  } else {
    ctx.status = 400
    ctx.body = { error: 'Invalid source. Must be "filesystem", "url", or "base64"' }
    return
  }

  ctx.body = await kyc({image})
  ctx.status = 200
  ctx.type = 'application/json'
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3000)