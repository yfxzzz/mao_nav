// 语言包定义
const translations = {
    en: {
        // 导航栏
        nav: {
            home: "Home",
            instructions: "Instructions",
            help: "FAQ",
            privacy: "Privacy Policy"
        },
        
        // 使用说明页面
        instructions: {
            title: "Instructions",
            description: "Learn how to use ImageCompressor to efficiently compress your image files",
            
            whatIs: {
                title: "What is ImageCompressor?",
                description: "ImageCompressor is a free online image compression tool designed to help users reduce image file sizes while maintaining good visual quality. It supports multiple common image formats, offers flexible compression options, and all processing is done locally in your browser to ensure privacy and security.",
                benefits: "Compressing images can help you:",
                benefit1: "Speed up website loading and improve user experience",
                benefit2: "Save storage space and bandwidth costs",
                benefit3: "Share images more quickly via email or messaging apps",
                benefit4: "Optimize image display on mobile devices"
            },
            
            steps: {
                title: "Usage Steps",
                step1: {
                    title: "Upload Images",
                    description: "You can upload images in three ways:",
                    method1: "Click the \"Select Files\" button to choose images from your device",
                    method2: "Drag and drop image files into the upload area",
                    method3: "Select multiple images for batch compression",
                    formats: "Supported image formats include: JPG, PNG, GIF, and WebP. Maximum file size is 10MB per file."
                },
                step2: {
                    title: "Set Compression Parameters",
                    description: "After uploading images, you can adjust the following compression parameters as needed:",
                    quality: "<strong>Compression Quality</strong>: Choose Low, Medium, or High quality, or use the slider for more precise adjustment",
                    format: "<strong>Output Format</strong>: Choose to keep the original format or convert to JPEG, PNG, or WebP"
                },
                tip: "Tip",
                step3: {
                    title: "Start Compression",
                    description1: "After setting the parameters, click the \"Start Compression\" button. The system will automatically process all uploaded images. During compression, you can see the real-time progress display.",
                    description2: "Compression speed depends on the number and size of your images, as well as your device performance. In most cases, compression of a single image only takes a few seconds."
                },
                step4: {
                    title: "Preview and Download",
                    description: "After compression is complete, you can:",
                    action1: "View the comparison between original and compressed images",
                    action2: "Check file sizes before and after compression and compression ratio",
                    action3: "Download individual compressed images",
                    action4: "Click the \"Download All Images\" button to batch download all compressed images"
                }
            },
            
            formats: {
                title: "Supported Image Formats",
                jpg: {
                    name: "JPG / JPEG",
                    description: "The most commonly used image format, supports lossy compression. Suitable for photos and complex images with high compression ratio."
                },
                png: {
                    name: "PNG",
                    description: "Supports transparent backgrounds and lossless compression. Suitable for icons, logos, and simple graphics, but files are usually larger."
                },
                gif: {
                    name: "GIF",
                    description: "Supports animation and limited color palette. Suitable for simple animations, but compression effects may not be as good as other formats."
                },
                webp: {
                    name: "WebP",
                    description: "Modern image format offering excellent compression ratio and quality. Supports transparent backgrounds, but compatibility may not be as good as JPG and PNG."
                }
            },
            
            principle: {
                title: "Image Compression Principles",
                intro: "Image compression reduces file size mainly through the following methods:",
                lossy: {
                    title: "1. Lossy Compression",
                    description: "Lossy compression reduces file size by reducing color information and details in the image. In most cases, this quality loss is not noticeable to the naked eye, but can significantly reduce file size. JPEG and WebP formats support lossy compression."
                },
                lossless: {
                    title: "2. Lossless Compression",
                    description: "Lossless compression reduces file size without losing any image quality. It achieves this through more efficient data encoding methods, but usually has a lower compression ratio than lossy compression. PNG and WebP formats support lossless compression."
                },
                resizing: {
                    title: "3. Size Adjustment",
                    description: "In addition to compression algorithms, ImageCompressor also automatically adjusts the size of oversized images. By default, images larger than 1920px are proportionally reduced, which can significantly reduce file size while still maintaining sufficient clarity for most display scenarios."
                },
                conversion: {
                    title: "4. Format Conversion",
                    description: "Different image formats have different compression algorithms and characteristics. For example, converting PNG images to WebP format can usually reduce file size by 25-35% while maintaining the same visual quality."
                },
                privacyNote: "All compression operations are performed locally in your browser and do not upload your images to any server. This means your images always remain private, and the compression process is usually very fast."
            }
        },
        
        // 常见问题页面
        help: {
            title: "Frequently Asked Questions",
            description: "Find answers to common questions about ImageCompressor",
            search: "Search questions...",
            categories: {
                general: "General Questions",
                technical: "Technical Issues",
                quality: "Image Quality",
                privacy: "Privacy & Security"
            },
            questions: {
                q1: {
                    question: "Is ImageCompressor completely free to use?",
                    answer: "Yes, ImageCompressor is completely free to use with no hidden costs or limitations. You can compress as many images as you want without any charges."
                },
                q2: {
                    question: "What image formats does ImageCompressor support?",
                    answer: "ImageCompressor supports JPG, PNG, GIF, and WebP formats. You can also convert between these formats during compression."
                },
                q3: {
                    question: "Is there a file size limit for images?",
                    answer: "Yes, the maximum file size for each image is 10MB. Files exceeding this limit will be automatically skipped during the compression process."
                },
                q4: {
                    question: "Can I compress multiple images at once?",
                    answer: "Yes, ImageCompressor supports batch compression. You can upload and compress multiple images simultaneously, which saves time when processing large numbers of images."
                },
                q5: {
                    question: "Where are my images processed?",
                    answer: "All image processing is done locally in your browser. Your images are never uploaded to any server, ensuring complete privacy and security."
                },
                q6: {
                    question: "Will compressing images reduce their quality?",
                    answer: "Lossy compression methods may slightly reduce image quality, but the difference is usually not noticeable to the human eye. ImageCompressor allows you to adjust the compression level to balance file size and image quality according to your needs."
                },
                q7: {
                    question: "Why choose WebP format?",
                    answer: "WebP is a modern image format that provides excellent compression while maintaining high quality. WebP images are typically 25-35% smaller than JPEG or PNG images of similar visual quality, making them ideal for websites and applications."
                },
                q8: {
                    question: "What should I do if the compression results are not satisfactory?",
                    answer: "If you're not satisfied with the compression results, you can try adjusting the compression quality settings. Higher quality settings will produce larger files with better image quality. You can also try different output formats to find the best balance for your specific needs."
                },
                q9: {
                    question: "Does ImageCompressor work on mobile devices?",
                    answer: "Yes, ImageCompressor has a responsive design that works perfectly on computers, tablets, and mobile phones. You can compress images anytime, anywhere using any device with a modern web browser."
                },
                q10: {
                    question: "Is my data secure when using ImageCompressor?",
                    answer: "Yes, all processing is done locally in your browser, and your images never leave your device. We do not collect, store, or share any of your image data, ensuring complete privacy and security."
                },
                q11: {
                    question: "Why are some of my images not being compressed?",
                    answer: "Images may not be compressed if they exceed the 10MB file size limit, are in an unsupported format, or if there's an issue with the image file itself. Please check these factors if you encounter problems with certain images."
                },
                q12: {
                    question: "How much can I reduce the file size?",
                    answer: "The compression ratio depends on the original image format, content, and the compression settings you choose. Typically, you can reduce file sizes by 50-80% while maintaining good visual quality. Some images may compress more effectively than others."
                }
            },
            noResults: "No matching questions found",
            contact: "Still have questions?",
            contactDesc: "If you can't find the answer to your question, please feel free to contact us"
        },
        
        // 隐私政策页面
        privacy: {
            title: "Privacy Policy",
            description: "Learn about how we protect your privacy and handle your data",
            
            intro: {
                title: "Introduction",
                content: "At ImageCompressor, we take your privacy very seriously. This privacy policy explains how we handle your information when you use our image compression service."
            },
            
            data: {
                title: "Data Collection",
                content: "We want to emphasize that ImageCompressor does not collect, store, or process any of your personal data or image files on our servers. All image processing is performed locally in your browser, and your images never leave your device."
            },
            
            local: {
                title: "Local Processing",
                content: "When you use ImageCompressor, all image compression and processing happens directly in your web browser. This means your images remain on your device at all times, and we have no access to them whatsoever."
            },
            
            storage: {
                title: "Local Storage",
                content: "ImageCompressor may use your browser's local storage to remember your language preferences and other settings to enhance your user experience. This data is stored only on your device and can be cleared at any time through your browser settings."
            },
            
            analytics: {
                title: "Usage Analytics",
                content: "We may use anonymous analytics to track general usage patterns of the website, such as page views and feature usage. This information is completely anonymous and cannot be used to identify individual users."
            },
            
            security: {
                title: "Security",
                content: "Since all processing is done locally in your browser, ImageCompressor provides an extremely high level of security. Your images and data never leave your device, eliminating any risk of data breaches or unauthorized access."
            },
            
            changes: {
                title: "Changes to This Policy",
                content: "We may update this privacy policy from time to time. Any changes will be posted on this page, and we encourage you to review the policy periodically."
            },
            
            contact: {
                title: "Contact Us",
                content: "If you have any questions or concerns about our privacy policy, please feel free to contact us."
            }
        },
        
        // 主页
        home: {
            title: "Simple and Efficient Online Image Compressor",
            description: "Easily reduce image file size, optimize web loading speed, and save storage space. Supports multiple image formats with good quality retention after compression.",
            
            // 上传区域
            upload: "Upload Images",
            dropZone: {
                text: "Drag & drop images here, or",
                button: "Select Files",
                supported: "Supported formats: JPG, PNG, GIF, WebP. Max file size: 10MB"
            },
            fileList: "Selected Files",
            
            // 压缩设置
            settings: "Compression Settings",
            quality: "Compression Quality",
            qualityLow: "Low",
            qualityMedium: "Medium",
            qualityHigh: "High",
            qualitySlider: {
                min: "Smallest File",
                mid: "Best Balance",
                max: "Highest Quality"
            },
            format: "Output Format",
            formatSame: "Keep Original",
            formatJpeg: "JPEG",
            formatPng: "PNG",
            formatWebp: "WebP",
            formatHint: "WebP format usually offers smaller file sizes",
            compressBtn: "Start Compression",
            
            // 压缩进度
            progress: "Compression Progress",
            overallProgress: "Overall Progress",
            currentFile: "Current File",
            preparing: "Preparing compression...",
            
            // 压缩结果
            results: "Compression Results",
            original: "Original",
            compressed: "Compressed",
            fileSize: "File Size",
            compressionRatio: "Compression Ratio",
            downloadAll: "Download All Images",
            compressMore: "Compress More Images",
            
            // 功能特点
            features: {
                fast: "Fast & Efficient",
                fastDesc: "Local compression processing, no server upload required, ensuring speed while protecting privacy",
                flexible: "Flexible Settings",
                flexibleDesc: "Support multiple compression quality options and format conversion to meet different needs",
                responsive: "Responsive Design",
                responsiveDesc: "Perfectly adapted for computers, tablets and mobile phones, use anytime, anywhere"
            }
        },
        
        // 通知
        notifications: {
            error: "Error",
            success: "Success",
            warning: "Warning",
            info: "Info",
            invalidFile: "Please select valid image files",
            noFiles: "Please select image files first",
            compressionComplete: "Successfully compressed {count} image files",
            downloadStarted: "Started downloading all compressed image files",
            fileTooLarge: "{count} files exceed the 10MB limit and have been automatically skipped"
        },
        
        // 页脚
        footer: {
            about: "About ImageCompressor",
            aboutDesc: "A simple, efficient, free online image compression tool to help you optimize image size and improve website loading speed.",
            quickLinks: "Quick Links",
            formats: "Supported Formats",
            contact: "Contact Us",
            contactDesc: "If you have any questions or suggestions, please feel free to contact us",
            copyright: "© 2025 ImageCompressor. All rights reserved."
        }
    },
    
    zh: {
        // 导航栏
        nav: {
            home: "主页",
            instructions: "使用说明",
            help: "常见问题",
            privacy: "隐私政策"
        },
        
        // 使用说明页面
        instructions: {
            title: "使用说明",
            description: "了解如何使用 ImageCompressor 高效压缩您的图片文件",
            
            whatIs: {
                title: "什么是 ImageCompressor？",
                description: "ImageCompressor 是一个免费的在线图片压缩工具，旨在帮助用户减小图片文件大小，同时保持良好的视觉质量。它支持多种常见图片格式，提供灵活的压缩选项，并且所有处理都在您的浏览器本地进行，确保隐私安全。",
                benefits: "压缩图片可以帮助您：",
                benefit1: "加快网站加载速度，提升用户体验",
                benefit2: "节省存储空间和带宽成本",
                benefit3: "更快速地分享图片通过电子邮件或消息应用",
                benefit4: "优化移动设备上的图片显示"
            },
            
            steps: {
                title: "使用步骤",
                step1: {
                    title: "上传图片",
                    description: "您可以通过以下三种方式上传图片：",
                    method1: "点击"选择文件"按钮，从您的设备中选择图片",
                    method2: "将图片文件拖放到上传区域",
                    method3: "同时选择多个图片进行批量压缩",
                    formats: "支持的图片格式包括：JPG、PNG、GIF 和 WebP。单个文件大小限制为 10MB。"
                },
                step2: {
                    title: "设置压缩参数",
                    description: "上传图片后，您可以根据需要调整以下压缩参数：",
                    quality: "<strong>压缩质量</strong>：选择低、中或高质量，或使用滑块进行更精确的调整",
                    format: "<strong>输出格式</strong>：选择保持原格式或转换为 JPEG、PNG 或 WebP"
                },
                tip: "提示",
                step3: {
                    title: "开始压缩",
                    description1: "设置好参数后，点击"开始压缩"按钮。系统将自动处理您上传的所有图片。压缩过程中，您可以看到实时进度显示。",
                    description2: "压缩速度取决于您的图片数量、大小以及您的设备性能。一般情况下，单个图片的压缩过程只需要几秒钟。"
                },
                step4: {
                    title: "预览和下载",
                    description: "压缩完成后，您可以：",
                    action1: "查看原图和压缩后图片的对比",
                    action2: "查看压缩前后的文件大小和压缩率",
                    action3: "下载单个压缩后的图片",
                    action4: "点击"下载所有图片"按钮批量下载所有压缩后的图片"
                }
            },
            
            formats: {
                title: "支持的图片格式",
                jpg: {
                    name: "JPG / JPEG",
                    description: "最常用的图片格式，支持有损压缩。适合照片和复杂图像，压缩率高。"
                },
                png: {
                    name: "PNG",
                    description: "支持透明背景和无损压缩。适合图标、徽标和简单图形，但文件通常较大。"
                },
                gif: {
                    name: "GIF",
                    description: "支持动画和有限的颜色 palette。适合简单动画，但压缩效果可能不如其他格式。"
                },
                webp: {
                    name: "WebP",
                    description: "现代图片格式，提供优秀的压缩率和质量。支持透明背景，但兼容性可能不如JPG和PNG。"
                }
            },
            
            principle: {
                title: "图片压缩原理",
                intro: "图片压缩主要通过以下几种方式减小文件大小：",
                lossy: {
                    title: "1. 有损压缩",
                    description: "有损压缩通过减少图像中的颜色信息和细节来减小文件大小。在大多数情况下，这种质量损失对肉眼来说并不明显，但可以显著减小文件大小。JPEG 和 WebP 格式支持有损压缩。"
                },
                lossless: {
                    title: "2. 无损压缩",
                    description: "无损压缩在不损失任何图像质量的情况下减小文件大小。它通过更高效的数据编码方式实现，但通常压缩率不如有损压缩。PNG 和 WebP 格式支持无损压缩。"
                },
                resizing: {
                    title: "3. 尺寸调整",
                    description: "除了压缩算法外，ImageCompressor 还会自动调整过大的图像尺寸。默认情况下，超过 1920px 的图像会被按比例缩小，这可以显著减小文件大小，同时对大多数显示场景来说仍然保持足够的清晰度。"
                },
                conversion: {
                    title: "4. 格式转换",
                    description: "不同的图片格式有不同的压缩算法和特点。例如，将 PNG 图像转换为 WebP 格式通常可以在保持相同视觉质量的情况下减小 25-35% 的文件大小。"
                },
                privacyNote: "所有压缩操作都在您的浏览器本地进行，不会将您的图片上传到任何服务器，这意味着您的图片始终保持私密，并且压缩过程通常非常快速。"
            }
        },
        
        // 常见问题页面
        help: {
            title: "常见问题",
            description: "查找关于 ImageCompressor 的常见问题解答",
            search: "搜索问题...",
            categories: {
                general: "一般问题",
                technical: "技术问题",
                quality: "图片质量",
                privacy: "隐私与安全"
            },
            questions: {
                q1: {
                    question: "ImageCompressor 是否完全免费使用？",
                    answer: "是的，ImageCompressor 完全免费使用，没有隐藏费用或限制。您可以无限制地压缩任意数量的图片。"
                },
                q2: {
                    question: "ImageCompressor 支持哪些图片格式？",
                    answer: "ImageCompressor 支持 JPG、PNG、GIF 和 WebP 格式。您还可以在压缩过程中在这些格式之间进行转换。"
                },
                q3: {
                    question: "图片有文件大小限制吗？",
                    answer: "是的，每个图片的最大文件大小为 10MB。超过此限制的文件将在压缩过程中自动跳过。"
                },
                q4: {
                    question: "我可以一次压缩多张图片吗？",
                    answer: "是的，ImageCompressor 支持批量压缩。您可以同时上传和压缩多张图片，这在处理大量图片时可以节省时间。"
                },
                q5: {
                    question: "我的图片在哪里处理？",
                    answer: "所有图片处理都在您的浏览器本地进行。您的图片永远不会上传到任何服务器，确保完全的隐私和安全。"
                },
                q6: {
                    question: "压缩图片会降低其质量吗？",
                    answer: "有损压缩方法可能会略微降低图片质量，但这种差异通常肉眼无法察觉。ImageCompressor 允许您调整压缩级别，根据您的需求平衡文件大小和图片质量。"
                },
                q7: {
                    question: "为什么选择 WebP 格式？",
                    answer: "WebP 是一种现代图片格式，在保持高质量的同时提供出色的压缩率。WebP 图片通常比同等视觉质量的 JPEG 或 PNG 图片小 25-35%，使其非常适合网站和应用程序。"
                },
                q8: {
                    question: "如果压缩结果不满意怎么办？",
                    answer: "如果您对压缩结果不满意，可以尝试调整压缩质量设置。更高的质量设置将产生更大的文件，但图片质量更好。您还可以尝试不同的输出格式，为您的特定需求找到最佳平衡。"
                },
                q9: {
                    question: "ImageCompressor 在移动设备上工作吗？",
                    answer: "是的，ImageCompressor 具有响应式设计，可以在计算机、平板电脑和手机上完美工作。您可以随时随地使用任何带有现代网络浏览器的设备压缩图片。"
                },
                q10: {
                    question: "使用 ImageCompressor 时我的数据安全吗？",
                    answer: "是的，所有处理都在您的浏览器本地进行，您的图片永远不会离开您的设备。我们不会收集、存储或分享您的任何图片数据，确保完全的隐私和安全。"
                },
                q11: {
                    question: "为什么我的一些图片没有被压缩？",
                    answer: "如果图片超过 10MB 文件大小限制、格式不受支持或图片文件本身存在问题，可能不会被压缩。如果您在处理某些图片时遇到问题，请检查这些因素。"
                },
                q12: {
                    question: "我可以减小多少文件大小？",
                    answer: "压缩率取决于原始图片格式、内容和您选择的压缩设置。通常，您可以在保持良好视觉质量的同时将文件大小减小 50-80%。有些图片可能比其他图片压缩效果更好。"
                }
            },
            noResults: "未找到匹配的问题",
            contact: "还有问题？",
            contactDesc: "如果您找不到问题的答案，请随时联系我们"
        },
        
        // 隐私政策页面
        privacy: {
            title: "隐私政策",
            description: "了解我们如何保护您的隐私并处理您的数据",
            
            intro: {
                title: "介绍",
                content: "在 ImageCompressor，我们非常重视您的隐私。本隐私政策解释了当您使用我们的图片压缩服务时，我们如何处理您的信息。"
            },
            
            data: {
                title: "数据收集",
                content: "我们想强调的是，ImageCompressor 不会在我们的服务器上收集、存储或处理您的任何个人数据或图片文件。所有图片处理都在您的浏览器本地进行，您的图片永远不会离开您的设备。"
            },
            
            local: {
                title: "本地处理",
                content: "当您使用 ImageCompressor 时，所有图片压缩和处理都直接在您的网络浏览器中进行。这意味着您的图片始终保留在您的设备上，我们完全无法访问它们。"
            },
            
            storage: {
                title: "本地存储",
                content: "ImageCompressor 可能会使用您浏览器的本地存储来记住您的语言偏好和其他设置，以提升您的用户体验。这些数据仅存储在您的设备上，可以随时通过浏览器设置清除。"
            },
            
            analytics: {
                title: "使用分析",
                content: "我们可能会使用匿名分析来跟踪网站的一般使用模式，例如页面浏览量和功能使用情况。这些信息完全匿名，无法用于识别个人用户。"
            },
            
            security: {
                title: "安全性",
                content: "由于所有处理都在您的浏览器本地进行，ImageCompressor 提供了极高的安全级别。您的图片和数据永远不会离开您的设备，消除了数据泄露或未授权访问的风险。"
            },
            
            changes: {
                title: "本政策的变更",
                content: "我们可能会不时更新本隐私政策。任何变更都会在此页面上发布，我们鼓励您定期查看本政策。"
            },
            
            contact: {
                title: "联系我们",
                content: "如果您对我们的隐私政策有任何问题或疑虑，请随时联系我们。"
            }
        },
        
        // 主页
        home: {
            title: "简单高效的在线图片压缩工具",
            description: "轻松减小图片文件大小，优化网页加载速度，节省存储空间。支持多种图片格式，压缩后保持良好画质。",
            
            // 上传区域
            upload: "上传图片",
            dropZone: {
                text: "拖放图片到此处，或",
                button: "选择文件",
                supported: "支持 JPG、PNG、GIF、WebP 格式，单个文件最大 10MB"
            },
            fileList: "已选择的文件",
            
            // 压缩设置
            settings: "压缩设置",
            quality: "压缩质量",
            qualityLow: "低",
            qualityMedium: "中",
            qualityHigh: "高",
            qualitySlider: {
                min: "最小文件",
                mid: "最佳平衡",
                max: "最高质量"
            },
            format: "输出格式",
            formatSame: "保持原格式",
            formatJpeg: "JPEG",
            formatPng: "PNG",
            formatWebp: "WebP",
            formatHint: "WebP 格式通常可以获得更小的文件大小",
            compressBtn: "开始压缩",
            
            // 压缩进度
            progress: "压缩进度",
            overallProgress: "总体进度",
            currentFile: "当前文件",
            preparing: "正在准备压缩...",
            
            // 压缩结果
            results: "压缩结果",
            original: "原图",
            compressed: "压缩后",
            fileSize: "文件大小",
            compressionRatio: "压缩率",
            downloadAll: "下载所有图片",
            compressMore: "压缩更多图片",
            
            // 功能特点
            features: {
                fast: "快速高效",
                fastDesc: "本地压缩处理，无需上传至服务器，保证速度的同时保护隐私",
                flexible: "灵活设置",
                flexibleDesc: "支持多种压缩质量选择和格式转换，满足不同场景需求",
                responsive: "响应式设计",
                responsiveDesc: "完美适配电脑、平板和手机等各种设备，随时随地使用"
            }
        },
        
        // 通知
        notifications: {
            error: "错误",
            success: "成功",
            warning: "警告",
            info: "提示",
            invalidFile: "请选择有效的图片文件",
            noFiles: "请先选择图片文件",
            compressionComplete: "已成功压缩 {count} 个图片文件",
            downloadStarted: "已开始下载所有压缩后的图片文件",
            fileTooLarge: "有 {count} 个文件超过 10MB 限制，已自动跳过"
        },
        
        // 页脚
        footer: {
            about: "关于 ImageCompressor",
            aboutDesc: "一个简单、高效、免费的在线图片压缩工具，帮助您优化图片大小，提升网站加载速度。",
            quickLinks: "快速链接",
            formats: "支持的格式",
            contact: "联系我们",
            contactDesc: "如有问题或建议，请随时联系我们",
            copyright: "© 2025 ImageCompressor. 保留所有权利。"
        }
    }
};

// 获取用户首选语言
function getUserPreferredLanguage() {
    // 检查本地存储中是否有保存的语言设置
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
        return savedLanguage;
    }
    
    // 获取浏览器语言设置
    const browserLanguage = navigator.language || navigator.userLanguage;
    const langCode = browserLanguage.split('-')[0]; // 获取语言代码（如 'en' 或 'zh'）
    
    // 如果浏览器语言是中文，返回中文，否则返回英文
    return langCode === 'zh' ? 'zh' : 'en';
}

// 设置页面语言
function setLanguage(lang) {
    if (!translations[lang]) {
        lang = 'en'; // 默认使用英文
    }
    
    // 保存语言设置到本地存储
    localStorage.setItem('preferredLanguage', lang);
    
    // 更新页面上所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(translations[lang], key);
        
        if (translation) {
            element.textContent = translation;
        }
    });
    
    // 更新页面上所有带有 data-i18n-placeholder 属性的元素的占位符
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = getNestedTranslation(translations[lang], key);
        
        if (translation) {
            element.placeholder = translation;
        }
    });
    
    // 更新页面上所有带有 data-i18n-value 属性的元素的值
    document.querySelectorAll('[data-i18n-value]').forEach(element => {
        const key = element.getAttribute('data-i18n-value');
        const translation = getNestedTranslation(translations[lang], key);
        
        if (translation) {
            element.value = translation;
        }
    });
    
    // 更新语言切换按钮的显示文本
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.textContent = lang === 'en' ? '中文' : 'English';
        langToggle.setAttribute('data-lang', lang === 'en' ? 'zh' : 'en');
    }
    
    // 更新文档语言属性
    document.documentElement.lang = lang;
}

// 获取嵌套的翻译值
function getNestedTranslation(obj, key) {
    const keys = key.split('.');
    let result = obj;
    
    for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            return null;
        }
    }
    
    return result;
}

// 初始化语言设置
window.initLanguage = function() {
    const lang = getUserPreferredLanguage();
    setLanguage(lang);
};

// 切换语言
window.toggleLanguage = function() {
    const currentLang = document.documentElement.lang || 'en';
    const newLang = currentLang === 'en' ? 'zh' : 'en';
    setLanguage(newLang);
};