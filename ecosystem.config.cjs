module.exports = {
    apps: [
        {
            name: "laravel-reverb",
            script: "artisan",
            interpreter: "php",
            args: "reverb:start",
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            env: {
                NODE_ENV: "production",
            }
        },

        {
            name: "laravel-worker",
            script: "artisan",
            interpreter: "php",
            args: "queue:work --sleep=3 --tries=3",
            autorestart: true,
            watch: false,
            instances: 1, // Ubah ke angka lebih tinggi jika antrean Anda sangat padat
            exec_mode: "fork",
            max_memory_restart: "200M"
        }
    ]
};
