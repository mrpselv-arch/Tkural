package com.ext.techapp.thirukkural.search;

import android.app.SearchManager;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AbsListView;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;

import androidx.appcompat.app.AppCompatActivity;

import com.ext.techapp.thirukkural.ItemDetailActivity;
import com.ext.techapp.thirukkural.ItemListFragment;
import com.ext.techapp.thirukkural.NavigationActivity;
import com.ext.techapp.thirukkural.R;
import com.ext.techapp.thirukkural.xml.CoupletsXMLParser;

import org.xmlpull.v1.XmlPullParserException;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SearchActivity extends AppCompatActivity implements AbsListView.OnItemClickListener, ItemListFragment.OnListFragmentInteractionListener {

    private ListView listView;
    private int queryInt;
    private String[] values;

    @Override
    public void onFragmentInteraction(int id, CoupletsXMLParser.Couplet couplet) {
        Intent intent = new Intent(this, ItemDetailActivity.class);
        intent.putExtra("couplet_number", couplet.getCoupletNumber());
        intent.putExtra("selected_couplet", couplet);
        startActivity(intent);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleSearch(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_search);
        listView = findViewById(android.R.id.list);
        handleSearch(getIntent());
    }

    private void handleSearch(Intent intent) {
        if (intent != null && Intent.ACTION_SEARCH.equals(intent.getAction())) {
            String query = intent.getStringExtra(SearchManager.QUERY);
            if (query != null) {
                try {
                    queryInt = Integer.parseInt(query.trim());
                } catch (NumberFormatException e) {
                    queryInt = 0;
                }
            }
        }

        List<String> results = new ArrayList<>();
        if (queryInt > 0 && queryInt <= 133) {
            results.add("அதிகாரம் : " + queryInt);
        }
        if (queryInt > 0 && queryInt <= 1330) {
            results.add("குறள் : " + queryInt);
        }

        if (results.isEmpty()) {
            results.add("எண் 1 முதல் 1330 வரை தேடவும் (குறள் அல்லது அதிகாரம் எண்)");
        }

        values = results.toArray(new String[0]);
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
                android.R.layout.simple_list_item_1, values);

        if (listView != null) {
            listView.setAdapter(adapter);
            listView.setOnItemClickListener(this);
        }
    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        if (values == null || position >= values.length) return;
        String selected = values[position];

        if (selected.contains("அதிகாரம்")) {
            Intent intent = new Intent(this, NavigationActivity.class);
            intent.putExtra(ItemListFragment.NAV_ITEM_ID, queryInt);
            startActivity(intent);
        } else if (selected.contains("குறள்")) {
            int couplet_index = queryInt % 10;
            int chapter = queryInt / 10;
            if (couplet_index != 0) {
                chapter = chapter + 1;
            } else {
                couplet_index = 10;
            }

            CoupletsXMLParser.Couplet couplet = getCouplet(chapter, couplet_index);
            if (couplet != null) {
                Intent intent = new Intent(this, ItemDetailActivity.class);
                intent.putExtra("couplet_number", couplet.getCoupletNumber());
                intent.putExtra("selected_couplet", couplet);
                startActivity(intent);
            }
        }
    }

    private CoupletsXMLParser.Couplet getCouplet(int chapter_code, int couplet_code) {
        int id = getResources().getIdentifier("chapter_" + chapter_code, "raw", this.getPackageName());
        if (id == 0) return null;

        try (InputStream in = getResources().openRawResource(id)) {
            Map<Integer, CoupletsXMLParser.Couplet> coupletsMap = new CoupletsXMLParser().coupletsList(in);
            CoupletsXMLParser.Couplet[] couplet_list_to_show = new CoupletsXMLParser.Couplet[10];
            int i = 0;
            for (Object key : coupletsMap.keySet()) {
                CoupletsXMLParser.Couplet kural = coupletsMap.get(key);
                if (i < 10) {
                    couplet_list_to_show[i] = kural;
                    i++;
                }
            }

            if (couplet_code >= 1 && couplet_code <= couplet_list_to_show.length) {
                return couplet_list_to_show[couplet_code - 1];
            }
        } catch (XmlPullParserException | IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}

