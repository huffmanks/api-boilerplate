import formidable from 'formidable'
import path from 'path'

const options = {
    keepExtensions: true,
    maxFiles: 0,
    typeAllowed: 'image',
}

const singleImageUpload = formidable(options)

// singleImageUpload.onPart = function (part) {
//     console.log(part)
//     if (part.file) {
//         if (!part.mimetype.includes('image') || !part.mimetype) {
//             return this.emit('error', {
//                 name: 'Unsupported Media Type',
//                 from: 'File Upload',
//                 field: part.name
//                     .split(/(?=[A-Z])/)
//                     .join(' ')
//                     .toLowerCase(),
//                 typeAllowed: this.options.typeAllowed,
//             })
//         }
//     }
// }

singleImageUpload.on('fileBegin', (formName, file) => {
    file.filepath = path.join('uploads/images', file.newFilename.toLowerCase())
})

export { singleImageUpload }
