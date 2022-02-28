import formidable from 'formidable'
import path from 'path'

const multipleFilesUpload = formidable({ keepExtensions: true })

multipleFilesUpload.on('fileBegin', (formName, file) => {
    if (file.mimetype && file.mimetype.includes('image')) {
        file.filepath = path.join('uploads/images', file.newFilename.toLowerCase())
    } else {
        file.filepath = path.join('uploads/files', file.newFilename.toLowerCase())
    }
})

export { multipleFilesUpload }
