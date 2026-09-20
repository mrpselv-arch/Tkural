package com.ext.techapp.thirukkural;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.text.Html;
import android.text.Spanned;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.ShareActionProvider;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.MenuItemCompat;

import com.ext.techapp.thirukkural.xml.CoupletsXMLParser;

public class ItemDetailActivity extends AppCompatActivity {

    private TextView couplet_detail;
    private ShareActionProvider mShareActionProvider;
    private CoupletsXMLParser.Couplet couplet;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_item_detail);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        couplet_detail = findViewById(R.id.couplet_detail);

        couplet = (CoupletsXMLParser.Couplet) getIntent().getSerializableExtra("selected_couplet");
        if (couplet == null) {
            finish();
            return;
        }

        setTitle("குறள் எண் " + couplet.getCoupletNumber());

        StringBuilder sb = new StringBuilder();
        sb.append(couplet.getFirstLineTamil()).append("<br/> ").append(couplet.getSecondLineTamil()).append("<br/><br/>");
        sb.append("<b>அதிகாரம் :</b> ").append(couplet.getChapterCode()).append(".").append(couplet.getChapterNameTamil());
        sb.append("<br/><br/>");

        sb.append("<b>மு.வ உரை</b><br/>").append(couplet.getMuvaExplanation());
        sb.append("<br/><br/><br/>");
        sb.append("<b>கலைஞர் உரை</b><br/>").append(couplet.getKalaignarExplanation());
        sb.append("<br/><br/><br/>");
        sb.append("<b>சாலமன் பாப்பையா உரை</b><br/>").append(couplet.getSolomonExplanation()).append("<br/><br/><br/>");

        sb.append("<b>Couplet Number </b>").append(couplet.getCoupletNumber());
        sb.append("<br/><br/><b>Translation</b>");
        sb.append("<hr>");
        sb.append("<br/><br/>").append(couplet.getFirstLineEnglish());
        sb.append("<br/>").append(couplet.getSecondLineEnglish());
        sb.append("<br/><br/>");
        sb.append("<b>Chapter Name :</b> ").append(couplet.getChapterCode()).append(".").append(couplet.getChapterNameEnglish());
        sb.append("<br/><br/>");

        sb.append("<b>Explanation</b><br/>");
        sb.append(couplet.getEnglishExplanation());

        Spanned str = Build.VERSION.SDK_INT >= Build.VERSION_CODES.N
                ? Html.fromHtml(sb.toString(), Html.FROM_HTML_MODE_LEGACY)
                : Html.fromHtml(sb.toString());
        couplet_detail.setText(str);
        couplet_detail.append("\n\n\n");

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_item_detail, menu);
        MenuItem item = menu.findItem(R.id.menu_item_share);
        if (item != null) {
            mShareActionProvider = (ShareActionProvider) MenuItemCompat.getActionProvider(item);
        }
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.menu_item_share) {
            Intent sendIntent = new Intent();
            sendIntent.setAction(Intent.ACTION_SEND);
            String toSend = getTitle() + "\n\n" + (couplet_detail != null ? couplet_detail.getText().toString() : "");
            sendIntent.putExtra(Intent.EXTRA_TEXT, toSend);
            sendIntent.setType("text/plain");
            startActivity(Intent.createChooser(sendIntent, "Share via"));
            return true;
        } else if (id == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}

