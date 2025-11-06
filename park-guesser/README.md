This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Getting Started

## Using Docker Compose:
```cd park-guesser```

### Start the app
```docker-compose up -d --build```

### View logs
```docker-compose logs -f```

### Stop the app
```docker-compose down```

## Or Using Docker directly:
### Build the image
```docker build -t park-guesser:latest .```

### Run the container
```docker run -d -p 8080:3000 --name park-guesser-test park-guesser:latest```

### View logs
```docker logs park-guesser-test```

### Stop container
```docker stop park-guesser-test```

### Remove container
```docker rm park-guesser-test```
