import formidable from 'formidable'
import path from 'path'

const options = {
    keepExtensions: true,
    multiples: true,
}

const multipleFilesUpload = formidable(options)

multipleFilesUpload.on('fileBegin', (formName, file) => {
    if (file.mimetype && file.mimetype.includes('image')) {
        file.filepath = path.join('uploads/images', file.newFilename)
    } else {
        file.filepath = path.join('uploads/files', file.newFilename)
    }
})

export { multipleFilesUpload }
