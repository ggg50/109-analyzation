import { Response, Request, NextFunction } from 'express'

export const accessTokenAuth = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.header('token')
  if (!accessToken) {
    return res.status(401).json({
      code: 50001,
      messaege: 'Invalid Access Token'
    })
  }
  next()
}
