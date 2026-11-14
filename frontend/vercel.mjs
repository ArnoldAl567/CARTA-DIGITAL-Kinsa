export const config = {
  framework: 'angular',
  outputDirectory: 'dist/kinsa-carta/browser',
  rewrites: [
    { source: '/administrar', destination: '/index.html' },
    {
      source: '/api/:path*',
      destination: process.env.VERCEL_ENV === 'production'
        ? 'https://carta-digital-kinsa-api.vercel.app/api/:path*'
        : 'https://carta-kinsa-api-pruebas.vercel.app/api/:path*',
    },
  ],
};
