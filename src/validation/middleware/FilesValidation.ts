import { Request, Response, NextFunction } from "express";
import { code422 } from "middleware/base.middleware";
const maxFileSize = 10 * 1024 * 1024;

export default function checkFiles() {
    return (request: Request, response: Response, next: NextFunction) => {
        if (request.files.length === 0) {
            next()
        } else {
            const { mimetype, size, originalname } = request.files[0];
            if (!mimetype.includes('image')) {
                code422(response, {
                    field: "file",
                    message: `File "${originalname}" should be image.`
                })
                if (size > maxFileSize) {
                    code422(response, {
                        field: "file",
                        message: `File ${originalname} should be less than 10Mib.`
                    })
                }
            } else {
                next()
            }
        }

    }
}