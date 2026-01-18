export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t mt-12">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* How it Works Section */}
          <div>
            <h3 className="font-semibold text-base mb-4">How it Works: Independent Car Finance Comparison</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This calculator provides a 100% independent side-by-side comparison of the three most common 
              ways to get behind the wheel in Australia: <strong>Outright Purchase (Cash)</strong>, 
              <strong> Traditional Car Finance (Loan)</strong>, and <strong>Novated Leasing (Salary Sacrifice)</strong>. 
              We are not affiliated with any lenders and do not use referral links.
            </p>
          </div>

          {/* Tax Brackets Section */}
          <div>
            <h3 className="font-semibold text-base mb-4">2025-2026 Australian Tax Brackets</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Our calculations use the legislated 2025-26 financial year income tax thresholds 
              (excluding 2% Medicare Levy):
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>$0 – $18,200: <span className="font-medium">0%</span></li>
              <li>$18,201 – $45,000: <span className="font-medium">16%</span></li>
              <li>$45,001 – $135,000: <span className="font-medium">30%</span></li>
              <li>$135,001 – $190,000: <span className="font-medium">37%</span></li>
              <li>$190,001+: <span className="font-medium">45%</span></li>
            </ul>
          </div>

          {/* EV & FBT Rules Section */}
          <div>
            <h3 className="font-semibold text-base mb-4">EV & PHEV FBT Rules for 2026</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Under the <strong>Federal Electric Car Discount</strong>, eligible zero-emission vehicles 
              priced below the Luxury Car Tax (LCT) threshold (<strong>$91,387 for FY 25/26</strong>) 
              are exempt from Fringe Benefits Tax (FBT).
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              <strong>Please note:</strong> Plug-in Hybrids (PHEVs) generally no longer qualify for 
              new FBT exemptions as of April 1, 2025.
            </p>
          </div>

          {/* 2026 Model Presets Section */}
          <div>
            <h3 className="font-semibold text-base mb-4">2026 Model Presets</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Quickly compare costs for Australia's top-selling 2026 models:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• Tesla Model 3</li>
              <li>• BYD Sealion 7</li>
              <li>• MG4 EV</li>
              <li>• Toyota RAV4 Hybrid</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              Use the vehicle selector above to load pre-configured pricing and running costs.
            </p>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed">
            <strong>Disclaimer:</strong> This calculator provides estimates only and does not constitute 
            financial or tax advice. Actual costs may vary based on individual circumstances, market conditions, 
            and specific vehicle and financing terms. Tax brackets and FBT rules are based on 2025-2026 
            Australian legislation. Please consult with a qualified financial advisor or tax professional 
            for personalized advice.
          </p>
          <p className="text-xs text-muted-foreground text-center mt-4">
            © 2026 carleasevsloanau.com | Independent Australian Car Finance Calculator
          </p>
        </div>
      </div>
    </footer>
  );
}
