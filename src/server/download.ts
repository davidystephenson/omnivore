void fetch('https://drive.usercontent.google.com/download?id=16zGxYMm6GRJcC9H8x4wksOtYS_RsksIN&export=download&authuser=0&confirm=t', {
  method: 'GET',
  redirect: 'follow'
})
  .then(async response => {
    if (response.url.includes('export=download')) {
      return await response.blob()
    } else {
      // Handle virus scan page - look for the actual download link
      return await response.text().then(async html => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const downloadLink = doc.querySelector('a[id="uc-download-link"]')
        if (downloadLink == null) {
          throw new Error('Could not find download link')
        }
        if (!('href' in downloadLink)) {
          throw new Error('Missing download link')
        }
        if (typeof downloadLink.href !== 'string') {
          throw new Error('Invalid download link')
        }
        console.log(downloadLink.href)
      })
    }
  })
