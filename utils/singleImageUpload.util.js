import formidable from 'formidable'
import path from 'path'

const options = {
    keepExtensions: true,
    maxFiles: 1,
}

const singleImageUpload = formidable(options)

singleImageUpload.on('fileBegin', (formName, file) => {
    if (file.mimetype && file.mimetype.includes('image')) {
        file.filepath = path.join('uploads/images', file.newFilename)
    }
})

export { singleImageUpload }
