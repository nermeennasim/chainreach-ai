# ChainReach AI - Content Generation from Segments (Simplified)
# This script fetches customer segments from the segmentation API
# and creates tailored marketing content for each segment using templates

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "ChainReach AI - Content Generation Pipeline" -ForegroundColor Cyan
Write-Host "Segments -> Content -> Messages" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

# APIs
$SegmentationAPI = "http://localhost:3000"

# Content templates for each segment type
$ContentTemplates = @{
    "New Customers" = @(
        @{
            title = "Welcome to Our Platform"
            content = "Get started with exclusive welcome offers"
            campaign_name = "New_Customer_Onboarding"
            audience = "New Users"
            content_type = "guide"
        },
        @{
            title = "First Purchase Bonus"
            content = "Enjoy 20% off on your first purchase"
            campaign_name = "Welcome_Discount"
            audience = "New Users"
            content_type = "promotion"
        }
    )
    "At Risk" = @(
        @{
            title = "We Miss You - Come Back Special"
            content = "Special re-engagement offer just for you"
            campaign_name = "Win_Back"
            audience = "Inactive Customers"
            content_type = "promotion"
        },
        @{
            title = "Whats New This Season"
            content = "Check out the latest products and services"
            campaign_name = "Seasonal_Update"
            audience = "Inactive Customers"
            content_type = "newsletter"
        }
    )
    "High Value Customers" = @(
        @{
            title = "Exclusive VIP Access"
            content = "Premium benefits for our most valued customers"
            campaign_name = "VIP_Program"
            audience = "High Value"
            content_type = "exclusive"
        },
        @{
            title = "Early Access to New Products"
            content = "Be the first to try our latest innovations"
            campaign_name = "Innovation_First"
            audience = "High Value"
            content_type = "exclusive"
        }
    )
    "VIP Enterprise" = @(
        @{
            title = "Enterprise Solutions Portal"
            content = "Advanced tools and dedicated support"
            campaign_name = "Enterprise_Portal"
            audience = "Enterprise"
            content_type = "service"
        },
        @{
            title = "Strategic Partnership Opportunities"
            content = "Explore co-marketing and integration options"
            campaign_name = "Partnership"
            audience = "Enterprise"
            content_type = "proposal"
        }
    )
    "Engaged SMB" = @(
        @{
            title = "Growth Acceleration Program"
            content = "Tools and resources to scale your business"
            campaign_name = "SMB_Growth"
            audience = "SMB"
            content_type = "program"
        },
        @{
            title = "Success Stories from SMBs Like You"
            content = "Learn how others achieved growth"
            campaign_name = "Case_Studies"
            audience = "SMB"
            content_type = "content"
        }
    )
}

# Message templates
$MessageTemplates = @{
    "New Customers" = @{
        subject = "Welcome to ChainReach - Your Journey Starts Here!"
        body = "Hi there,`n`nWelcome to the ChainReach community! We're excited to have you on board.`n`nTo help you get started, we've prepared exclusive onboarding content tailored to your needs. Check out our welcome guides and special offers.`n`nHappy to have you with us!`n`nBest regards,`nChainReach Team"
    }
    "At Risk" = @{
        subject = "We Miss You - Special Offer Inside"
        body = "Hi,`n`nWe noticed you haven't visited us in a while. We'd love to have you back!`n`nWe've prepared some special offers and fresh content just for you. Come back and see what's new.`n`nWe value your business,`nChainReach Team"
    }
    "High Value Customers" = @{
        subject = "Exclusive VIP Benefits Await You"
        body = "Dear Valued Customer,`n`nThank you for your continued loyalty and support. We'd like to extend exclusive VIP benefits to you.`n`nYou now have early access to new products and premium support. Enjoy!`n`nWith appreciation,`nChainReach Team"
    }
    "VIP Enterprise" = @{
        subject = "Strategic Partnership & Enterprise Solutions"
        body = "Dear Enterprise Partner,`n`nThank you for being a key partner. We have exciting opportunities to explore together.`n`nOur enterprise solutions team would like to discuss strategic collaboration options with you.`n`nLet's connect,`nChainReach Enterprise Team"
    }
    "Engaged SMB" = @{
        subject = "Scale Your Business with ChainReach"
        body = "Hi,`n`nThank you for your engagement and support. We want to help you scale even further.`n`nWe've compiled growth resources and case studies from successful SMBs like you.`n`nLet's grow together,`nChainReach Team"
    }
}

# Step 1: Get segments from segmentation API
Write-Host "STEP 1: Fetching Customer Segments from Segmentation API" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

try {
    $segments = Invoke-RestMethod -Uri "$SegmentationAPI/api/segments" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "[OK] Retrieved $($segments.data.Count) customer segments" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to get segments: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2 & 3: Generate content and messages for each segment
Write-Host ""
Write-Host "STEP 2-3: Generating Content & Messages for Each Segment" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

$results = @()

$segments.data | ForEach-Object {
    $segment = $_
    $segmentName = $segment.name
    
    Write-Host "Processing Segment: $segmentName" -ForegroundColor Cyan
    Write-Host "  Description: $($segment.description)" -ForegroundColor Gray
    
    # Get content template for this segment
    $templateContent = $ContentTemplates[$segmentName]
    $templateMessage = $MessageTemplates[$segmentName]
    
    if ($templateContent -and $templateMessage) {
        Write-Host "  [OK] Generated $($templateContent.Count) content items" -ForegroundColor Green
        Write-Host "  [OK] Message subject: $($templateMessage.subject)" -ForegroundColor Green
        
        # Show content
        $templateContent | ForEach-Object {
            Write-Host "    - $($_.title) ($($_.content_type))" -ForegroundColor DarkGray
        }
        
        # Add to results
        $results += @{
            segment = $segmentName
            description = $segment.description
            criteria = $segment.criteria
            content_items = $templateContent.Count
            content = $templateContent
            message = $templateMessage
            status = "GENERATED"
        }
    } else {
        Write-Host "  [WARN] No template found for this segment" -ForegroundColor Yellow
        $results += @{
            segment = $segmentName
            description = $segment.description
            content_items = 0
            status = "NO_TEMPLATE"
        }
    }
    
    Write-Host ""
}

# Step 4: Summary
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "WORKFLOW SUMMARY - Content Generated" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Segments Processed: $($results.Count)" -ForegroundColor Cyan
$generatedCount = ($results | Where-Object { $_.status -eq "GENERATED" }).Count
Write-Host "Successfully Generated: $generatedCount segments" -ForegroundColor Green
Write-Host ""

# Display each segment's content
$results | Where-Object { $_.status -eq "GENERATED" } | ForEach-Object {
    Write-Host "================================================================" -ForegroundColor DarkCyan
    Write-Host "Segment: $($_.segment)" -ForegroundColor Cyan
    Write-Host "Content Items: $($_.content_items)" -ForegroundColor White
    Write-Host ""
    Write-Host "Message Generated:" -ForegroundColor White
    Write-Host "  Subject: $($_.message.subject)" -ForegroundColor Yellow
    Write-Host "  Body Preview:" -ForegroundColor Yellow
    $preview = $_.message.body.Split("`n") | Select-Object -First 3
    $preview | ForEach-Object {
        Write-Host "    $_" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Content Available:" -ForegroundColor White
    $_.content | ForEach-Object {
        Write-Host "  - $($_.title)" -ForegroundColor DarkGray
        Write-Host "    Type: $($_.content_type) | Campaign: $($_.campaign_name)" -ForegroundColor DarkGray
    }
    Write-Host ""
}

# Export results to JSON
$exportPath = "c:\Users\nerme\Desktop\hackathon AI-2025\chainreach-ai\segment_content_results.json"
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $exportPath -Encoding UTF8
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "[OK] Results exported to: segment_content_results.json" -ForegroundColor Green
Write-Host "[OK] Ready for next stage: Compliance Check" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Cyan
